import {Market} from '@nexex/orderbook-client';
import {OrderSide} from '@nexex/types';
import * as R from 'ramda';
import {Action, AnyAction} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {Observable, of, from, timer} from 'rxjs';
import {
    catchError,
    filter,
    map,
    mergeMap,
    switchMap,
    takeUntil,
    withLatestFrom
} from 'rxjs/operators';
import {EpicDependencies} from '../../types';
import {
    convertFtOrder
} from '../../utils/DexOrderUtil';
import {OrderbookState} from '../reducers/orderbook.reducer';
import {chainEpics} from '../../utils/epicUtils';
import {GlobalActionType, MarketSelectedAction} from '../actions/global.action';
import {
    loadConfig,
    mergeUnionOrders,
    OrderBookActionType, requestConfig, RequestConfigAction,
    requestOBSnapshot,
    RequestOrderBookAction
} from '../actions/orderbook.action';
import {GlobalState} from '../reducers/global.reducer';

const clearOrderbookEpic = chainEpics(
    GlobalActionType.MARKET_SELECTED,
    OrderBookActionType.CLEAR
);

const subscribeOrderbookEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType<AnyAction>(GlobalActionType.APP_INIT),
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
                        obEvent.payload.marketId === selectedMarket.marketId
                ),
                map(([obEvent, state]) => {
                    const {
                        global: {selectedMarket}
                    } = state as {global: GlobalState};
                    const {
                        payload: {order}
                    } = obEvent;
                    return mergeUnionOrders(order.side, [
                        convertFtOrder(selectedMarket, order)
                    ]);
                })
            );
        })
    );

const requestOrderbookSnapshotEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType<AnyAction>(GlobalActionType.MARKET_SELECTED),
        withLatestFrom(state$),
        mergeMap(([, state]) => {
            const {
                global: {selectedMarket}
            } = state as {global: GlobalState};
            obClient.subscribe(
                selectedMarket.base.addr,
                selectedMarket.quote.addr
            );
            return timer(0, 10000).pipe(
                takeUntil(
                    action$.pipe(
                        ofType<AnyAction>(GlobalActionType.MARKET_SELECTED)
                    )
                ),
                switchMap(() => {
                    return of(requestOBSnapshot(selectedMarket));
                })
            );
        })
    );

const fetchOrderbookSnapshotEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType<RequestOrderBookAction>(
            OrderBookActionType.OB_SNAPSHOT_REQUEST
        ),
        withLatestFrom(state$),
        mergeMap(async ([action, state]) => {
            const {
                global: {selectedMarket}
            } = state as {global: GlobalState};
            const {
                base: {addr: baseTokenAddr},
                quote: {addr: quoteTokenAddr}
            } = selectedMarket as Market;
            const ob = await obClient.snapshot(
                `${baseTokenAddr}-${quoteTokenAddr}`
            );
            const convertFtOrderFn = R.curry(convertFtOrder)(
                selectedMarket
            );
            return [
                mergeUnionOrders(
                    OrderSide.BID,
                    R.map(convertFtOrderFn, ob.bids)
                ),
                mergeUnionOrders(
                    OrderSide.ASK,
                    R.map(convertFtOrderFn, ob.asks)
                )
            ];
        }),
        switchMap(actions => from(actions)),
        catchError(error =>
            of({
                type: OrderBookActionType.OB_SNAPSHOT_ERROR,
                payload: error,
                error: true
            })
        )
    );

const requestMarketConfigEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
): Observable<Action> =>
    action$.pipe(
        ofType(GlobalActionType.MARKET_SELECTED),
        withLatestFrom(state$),
        filter(([action, state]) => {
            const {configs} = state.orderbook as OrderbookState;
            const {payload} = action as MarketSelectedAction;
            return !configs[payload.marketId];
        }),
        mergeMap(([action]) => {
            const {payload} = action as MarketSelectedAction;
            return of(requestConfig(payload.marketId));
        })
    );

const loadMarketConfigEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {obClient}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType(OrderBookActionType.CONFIG_REQUEST),
        withLatestFrom(state$),
        mergeMap(async ([action]) => {
            const {payload} = action as RequestConfigAction;
            const config = await obClient.marketConfig(payload);
            return loadConfig(payload, config);
        })
    );

export default combineEpics(
    clearOrderbookEpic,
    fetchOrderbookSnapshotEpic,
    loadMarketConfigEpic,
    requestMarketConfigEpic,
    requestOrderbookSnapshotEpic,
    subscribeOrderbookEpic
);
