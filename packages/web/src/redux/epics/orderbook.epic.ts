import {OrderSide} from '@nexex/types';
import {Market, ObEventTypes, OrderUpdateEvent, OrderDelistEvent} from '@nexex/types/orderbook';
import * as R from 'ramda';
import {Action} from 'redux-actions';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {from, Observable, of, timer} from 'rxjs';
import {catchError, filter, map, mergeMap, switchMap, takeUntil, withLatestFrom} from 'rxjs/operators';
import {EpicDependencies} from '../../types';
import {convertFtOrder} from '../../utils/DexOrderUtil';
import {chainEpics} from '../../utils/epicUtils';
import {GlobalActionType, MarketSelectedAction} from '../actions/global.action';
import {
    DownstreamAction,
    downstreamEvent,
    loadConfig,
    mergeOrders,
    OrderBookActionType, removeOrder,
    requestConfig,
    RequestConfigAction,
    requestOBSnapshot,
    RequestOrderBookAction,
    updateOrderVolume
} from '../actions/orderbook.action';
import {GlobalState} from '../reducers/global.reducer';
import {OrderbookState} from '../reducers/orderbook.reducer';

const clearOrderbookEpic = chainEpics(
    GlobalActionType.MARKET_SELECTED,
    OrderBookActionType.CLEAR
);

const subscribeOrderbookEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action<any>> =>
    action$.pipe(
        ofType<Action<any>>(GlobalActionType.APP_INIT),
        mergeMap(() => {
            return obClient.events$.pipe(
                withLatestFrom(state$),
                filter(
                    ([
                         obEvent,
                         {
                             global: {selectedMarket}
                         }
                     ]) =>
                        obEvent.type === ObEventTypes.NEW_ORDER_ACCEPTED &&
                        selectedMarket &&
                        obEvent.payload.marketId === selectedMarket.marketId
                ),
                map(([obEvent, state]) => {
                    const {
                        global: {selectedMarket}
                    } = state as {global: GlobalState};
                    const {
                        payload: {order}
                    } = obEvent;
                    return mergeOrders(order.side, [
                        convertFtOrder(selectedMarket, order)
                    ]);
                })
            );
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
            return from(obClient.snapshot(
                `${baseTokenAddr}-${quoteTokenAddr}`, 50, false
            )).pipe(
                switchMap((ob) => {
                    const {
                        global: {selectedMarket}
                    } = state as {global: GlobalState};
                    const convertFtOrderFn = R.curry(convertFtOrder)(
                        selectedMarket
                    );
                    return from([
                        mergeOrders(
                            OrderSide.BID,
                            R.map(convertFtOrderFn, ob.bids)
                        ),
                        mergeOrders(
                            OrderSide.ASK,
                            R.map(convertFtOrderFn, ob.asks)
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

export default combineEpics(
    clearOrderbookEpic,
    fetchOrderbookSnapshotEpic,
    loadMarketConfigEpic,
    requestMarketConfigEpic,
    requestOrderbookSnapshotEpic,
    subscribeOrderbookEpic,
    initObWebSocketEpic,
    updateObOrderEpic,
    delistObOrderEpic
);
