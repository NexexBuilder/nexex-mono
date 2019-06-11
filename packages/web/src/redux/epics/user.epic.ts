import {Dex} from '@nexex/api';
import {OrderSide, OrderState} from '@nexex/types';
import BigNumber from 'bignumber.js';
import differenceInSeconds from 'date-fns/difference_in_seconds';
import * as R from 'ramda';
import {Action} from 'redux-actions';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {combineLatest, EMPTY, from, interval, Observable} from 'rxjs';
import {map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {AmountUnit} from '../../constants';
import {EpicDependencies, FtOrder} from '../../types';
import {Amount} from '../../utils/Amount';
import {fromPlainDexOrder} from '../../utils/DexOrderUtil';
import {ExchangeActionType, PublishOrderAction} from '../actions/exchange.action';
import {GlobalActionType} from '../actions/global.action';
import {insertUserOrder, updateUserOrder} from '../actions/user.action';
import {GlobalState} from '../reducers/global.reducer';
import {getMyOrder} from '../selectors/orderbook.selector';


const userOrderEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action<any>> =>
    combineLatest([dexPromise, action$.pipe(
        ofType<PublishOrderAction>(ExchangeActionType.ORDER_PUBLISHED))])
        .pipe(
            withLatestFrom(state$),
            mergeMap(async ([[dex, {payload}], state]) => {
                const {selectedMarket} = state.global as GlobalState;
                const order = fromPlainDexOrder(selectedMarket.base, selectedMarket.quote, payload);
                const updated = await updateFtOrderBalance(dex, order);
                return insertUserOrder(updated);
            })
        );

const UPDATE_INTERVAL_SECONDS = 1 * 60;
const updateUserOrderEpic = (
    action$: Observable<Action<any>>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action<any>> =>
    combineLatest([dexPromise, action$.pipe(
        ofType<PublishOrderAction>(GlobalActionType.EXCHANGE_INIT_COMPLETE))])
        .pipe(
            mergeMap( ([dex]) => {
                return interval(UPDATE_INTERVAL_SECONDS * 1000).pipe(
                    withLatestFrom(state$),
                    switchMap(([,state]) => {
                        const now = new Date();
                        const orders = R.filter(order => !order.lastUpdate ||
                            (differenceInSeconds(now, order.lastUpdate) > UPDATE_INTERVAL_SECONDS && order.state === OrderState.OPEN)
                            , getMyOrder(state)
                        );
                        if (orders.length === 0) {
                            return EMPTY;
                        }
                        return from(Promise.all(orders.map(order => updateFtOrderBalance(dex, order)))).pipe(
                            map(updatedOrders => updateUserOrder(updatedOrders))
                        );

                        // return updateUserOrder(updatedOrders);
                    })
                );
            }),
            // withLatestFrom(state$),
            // mergeMap(async ([[dex, {payload}], state]) => {
            //     const now = new Date();
            //     const orders = R.filter(order => !order.lastUpdate ||
            //         (differenceInSeconds(now, order.lastUpdate) > UPDATE_INTERVAL_SECONDS && order.state === OrderState.OPEN)
            //         , getMyOrder(state)
            //     );
            //     const updatedOrders = await Promise.all(orders.map(order => updateFtOrderBalance(dex, order)));
            //
            //     return updateUserOrder(updatedOrders);
            // })
        );

async function updateFtOrderBalance(dex: Dex, order: FtOrder): Promise<FtOrder> {
    const availableTakerVolume = new BigNumber((await dex.exchange.availableVolume(order.signedOrder)).toHexString());
    const availableMakerVolume = availableTakerVolume.times(order.signedOrder.makerTokenAmount).div(order.signedOrder.takerTokenAmount);
    let remainingBaseTokenAmount: Amount;
    let remainingQuoteTokenAmount: Amount;
    if (order.side === OrderSide.ASK) {
        remainingBaseTokenAmount = new Amount(availableMakerVolume, AmountUnit.WEI, order.remainingBaseTokenAmount.decimals);
        remainingQuoteTokenAmount = new Amount(availableTakerVolume, AmountUnit.WEI, order.remainingQuoteTokenAmount.decimals);
    } else {
        remainingBaseTokenAmount = new Amount(availableTakerVolume, AmountUnit.WEI, order.remainingBaseTokenAmount.decimals);
        remainingQuoteTokenAmount = new Amount(availableMakerVolume, AmountUnit.WEI, order.remainingQuoteTokenAmount.decimals);
    }
    order.remainingBaseTokenAmount = remainingBaseTokenAmount;
    order.remainingQuoteTokenAmount = remainingQuoteTokenAmount;
    const now = new Date();
    order.lastUpdate = now;
    if (now > new Date(order.signedOrder.expirationUnixTimestampSec * 1000)){
        order.state = OrderState.EXPIRED;
    }
    if (remainingQuoteTokenAmount.toWei().isZero()) {
        order.state = OrderState.CLOSED;
    }
    return order;
}

export default combineEpics(
    userOrderEpic,
    updateUserOrderEpic
);
