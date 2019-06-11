import {OrderSide} from '@nexex/types';
import {Market, NewOrderAcceptedEvent, ObEventTypes, OrderDelistEvent, OrderUpdateEvent} from '@nexex/types/orderbook';
import * as R from 'ramda';
import {Action} from 'redux-actions';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {EMPTY, from, Observable, of, timer} from 'rxjs';
import {catchError, filter, map, mergeMap, switchMap, takeUntil, withLatestFrom} from 'rxjs/operators';
import {EpicDependencies, FtOrderAggregate} from '../../types';
import {convertFtOrder, convertFtOrderAggregate} from '../../utils/DexOrderUtil';
import {chainEpics} from '../../utils/epicUtils';
import {GlobalActionType, MarketSelectedAction} from '../actions/global.action';
import {
    DownstreamAction,
    downstreamEvent,
    loadConfig, mergeAgOrder,
    mergeOrder,
    mergeOrders,
    OrderBookActionType,
    removeOrder,
    requestConfig,
    RequestConfigAction,
    requestOBSnapshot,
    requestOrderAg, RequestOrderAgAction,
    RequestOrderBookAction,
    updateOrderVolume
} from '../actions/orderbook.action';
import {GlobalState} from '../reducers/global.reducer';
import {OrderbookState} from '../reducers/orderbook.reducer';

const clearOrderbookEpic = chainEpics(
    GlobalActionType.MARKET_SELECTED,
    OrderBookActionType.CLEAR
);

const newOrderArrivalEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>
): Observable<Action<any>> =>
    action$.pipe(
        ofType<DownstreamAction>(OrderBookActionType.OB_DOWNSTREAM_EVENT),
        map(evt => evt.payload),
        ofType<NewOrderAcceptedEvent>(ObEventTypes.NEW_ORDER_ACCEPTED),
        withLatestFrom(state$),
        filter(
            ([
                 obEvent,
                 {global: {selectedMarket}}
             ]) =>
                obEvent.type === ObEventTypes.NEW_ORDER_ACCEPTED &&
                selectedMarket &&
                obEvent.payload.marketId === selectedMarket.marketId
        ),
        mergeMap(([obEvent, state]) => {
            const {
                payload: {order}
            } = obEvent as NewOrderAcceptedEvent;
            const {selectedMarket} = state.global as GlobalState;
            const {bids, asks, decimals} = state.orderbook as OrderbookState;
            const orders = order.side === OrderSide.ASK ? asks : bids;
            // if find a match orderAggregate
            if (orders.find(o => o.price.eq(order.price.decimalPlaces(decimals)))) {
                return of(mergeOrder(convertFtOrder(selectedMarket, order)));
            }

            if (order.side === OrderSide.ASK) {
                const minPrice = R.reduce(
                    R.minBy<FtOrderAggregate>(order => order.price.toNumber()), orders[0], orders
                ).price;
                if (order.price.gt(minPrice)) {
                    return EMPTY;
                } else {
                    return of(requestOrderAg(selectedMarket.marketId, OrderSide.ASK, order.price.decimalPlaces(decimals).toString(10)));
                }
            } else {
                const maxPrice = R.reduce(
                    R.maxBy<FtOrderAggregate>(order => order.price.toNumber()), orders[0], orders
                ).price;
                if (order.price.lt(maxPrice)) {
                    return EMPTY;
                } else {
                    return of(requestOrderAg(selectedMarket.marketId, OrderSide.BID, order.price.decimalPlaces(decimals).toString(10)));
                }
            }
        })
    );

const fetchOrderAgEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action<any>> =>
    action$.pipe(
        ofType<RequestOrderAgAction>(OrderBookActionType.ORDER_AG_REQUEST),
        withLatestFrom(state$),
        filter(([action, state]) => action.payload.marketId === (state.global as GlobalState).selectedMarket.marketId),
        mergeMap(([action, state]) => {
            const {selectedMarket} = state.global as GlobalState;
            const {marketId, price, side} = action.payload;
            return from(obClient.queryOrderAggregate(marketId, side, price)).pipe(
                map(order=> mergeAgOrder(convertFtOrderAggregate(selectedMarket, side, order)))
            )
        })
    );

const requestOrderbookSnapshotEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action<any>> =>
    action$.pipe(
        ofType<MarketSelectedAction>(GlobalActionType.MARKET_SELECTED),
        withLatestFrom(state$),
        mergeMap(([, state]) => {
            const {
                global: {selectedMarket}
            } = state as {global: GlobalState};
            obClient.subscribe(
                selectedMarket.base.addr,
                selectedMarket.quote.addr
            );
            return timer(0, 2 * 60 * 1000).pipe(
                takeUntil(
                    action$.pipe(
                        ofType<MarketSelectedAction>(GlobalActionType.MARKET_SELECTED)
                    )
                ),
                switchMap(() => {
                    return of(requestOBSnapshot(selectedMarket));
                })
            );
        })
    );

const fetchOrderbookSnapshotEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action<any>> =>
    action$.pipe(
        ofType<RequestOrderBookAction>(
            OrderBookActionType.OB_SNAPSHOT_REQUEST
        ),
        withLatestFrom(state$),
        mergeMap(([action, state]) => {
            const {
                global: {selectedMarket}
            } = state as {global: GlobalState};
            const {
                base: {addr: baseTokenAddr},
                quote: {addr: quoteTokenAddr}
            } = selectedMarket as Market;
            const {decimals} = state.orderbook as OrderbookState;
            return from(obClient.topOrders(
                `${baseTokenAddr}-${quoteTokenAddr}`, 20, decimals
            )).pipe(
                switchMap((ob) => {
                    const {
                        global: {selectedMarket}
                    } = state as {global: GlobalState};
                    const convertBidOrderFn = R.curry(convertFtOrderAggregate)(
                        selectedMarket, OrderSide.BID
                    );
                    const convertAskOrderFn = R.curry(convertFtOrderAggregate)(
                        selectedMarket, OrderSide.ASK
                    );
                    return from([
                        mergeOrders(
                            OrderSide.BID,
                            R.map(convertBidOrderFn, ob.bids)
                        ),
                        mergeOrders(
                            OrderSide.ASK,
                            R.map(convertAskOrderFn, ob.asks)
                        )
                    ]);
                }),
                catchError(error =>
                    of({
                        type: OrderBookActionType.OB_SNAPSHOT_ERROR,
                        payload: error,
                        error: true
                    })
                )
            );
        })
    );

const requestMarketConfigEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>
): Observable<Action<any>> =>
    action$.pipe(
        ofType<MarketSelectedAction>(GlobalActionType.MARKET_SELECTED),
        withLatestFrom(state$),
        filter(([action, state]) => {
            const {configs} = state.orderbook as OrderbookState;
            const {payload} = action;
            return !configs[payload.marketId];
        }),
        mergeMap(([action]) => {
            const {payload} = action as MarketSelectedAction;
            return of(requestConfig(payload.marketId));
        })
    );

const loadMarketConfigEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action<any>> =>
    action$.pipe(
        ofType<RequestConfigAction>(OrderBookActionType.CONFIG_REQUEST),
        withLatestFrom(state$),
        mergeMap(async ([action]) => {
            const {payload} = action;
            const config = await obClient.marketConfig(payload);
            return loadConfig(payload, config);
        })
    );

const initObWebSocketEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action<any>> =>
    action$.pipe(
        ofType(GlobalActionType.APP_INIT),
        mergeMap(() =>
            obClient.events$.pipe(
                filter(event => event.id === undefined),
                map(event => downstreamEvent(event as any))
            )
        )
    );

const updateObOrderEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>
): Observable<Action<any>> =>
    action$.pipe(
        ofType<DownstreamAction>(OrderBookActionType.OB_DOWNSTREAM_EVENT),
        map(evt => evt.payload),
        ofType<OrderUpdateEvent>(ObEventTypes.ORDER_BALANCE_UPDATE),
        withLatestFrom(state$),
        filter(([action, state]) => action.payload.marketId === (state.global as GlobalState).selectedMarket.marketId),
        mergeMap(([action]) => {
            return of(updateOrderVolume(action.payload))
        })
    );

const delistObOrderEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>
): Observable<Action<any>> =>
    action$.pipe(
        ofType<DownstreamAction>(OrderBookActionType.OB_DOWNSTREAM_EVENT),
        map(evt => evt.payload),
        ofType<OrderDelistEvent>(ObEventTypes.ORDER_DELIST),
        withLatestFrom(state$),
        filter(([action, state]) => action.payload.marketId === (state.global as GlobalState).selectedMarket.marketId),
        mergeMap(([action]) => {
            const {orderHash, orderSide} = action.payload;
            return of(removeOrder(orderSide, orderHash));
        })
    );

// const orderArrivalEpic

export default combineEpics(
    clearOrderbookEpic,
    fetchOrderbookSnapshotEpic,
    loadMarketConfigEpic,
    requestMarketConfigEpic,
    requestOrderbookSnapshotEpic,
    newOrderArrivalEpic,
    fetchOrderAgEpic,
    initObWebSocketEpic,
    updateObOrderEpic,
    delistObOrderEpic
);
