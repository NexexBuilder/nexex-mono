import {orderUtil} from '@nexex/api/utils';
import {Action} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {combineLatest, of} from 'rxjs';
import {Observable} from 'rxjs/internal/Observable';
import {mergeMap, withLatestFrom} from 'rxjs/operators';
import {EpicDependencies} from '../../types';
import {getMetamaskSigner} from '../../utils/metamaskUtil';
import {
    ExchangeActionType,
    OrderCancelAction,
    OrderFillAction,
    orderPublished,
    SubmitOrderAction
} from '../actions/exchange.action';
import {fromTransactionEvent} from './ethereum.epic';

export const submitOrderEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise, obClient}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType(ExchangeActionType.ORDER_SUBMIT),
        mergeMap(async (action: SubmitOrderAction) => {
            const order = action.payload;
            const dex = await dexPromise;
            order.exchangeContractAddress = await dex.exchange.getContractAddress();
            const signed = await dex.signOrder(getMetamaskSigner(), order);
            const orderHash = orderUtil.getOrderHashHex(signed);
            await obClient.placeOrder(orderHash, signed);
            return orderPublished(signed);
        })
    );

export const fillOrderEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        dexPromise, action$.pipe(
            ofType<OrderFillAction>(ExchangeActionType.ORDER_FILL)
        )])
        .pipe(
            withLatestFrom(state$),
            mergeMap(([[dex, action], state]) => {
                const {order, takerAmount} = action.payload;
                const tx = dex.exchange.fillOrder(getMetamaskSigner(), order, takerAmount, state.global.siteConfig.takerFeeRecipient, false)

                return fromTransactionEvent(tx, 'ETH_ORDER_FILL', state.wallet.walletAddr, action.payload);
            })
        );

export const cancelOrderEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        dexPromise, action$.pipe(
            ofType<OrderCancelAction>(ExchangeActionType.ORDER_CANCEL)
        )])
        .pipe(
            withLatestFrom(state$),
            mergeMap(([[dex, action], state]) => {
                const {signedOrder} = action.payload;
                const tx = dex.exchange.cancelOrder(getMetamaskSigner(), signedOrder);

                return fromTransactionEvent(tx, 'ETH_ORDER_CANCEL', state.wallet.walletAddr, {order: signedOrder});
            })
        );

export default combineEpics(submitOrderEpic, fillOrderEpic, cancelOrderEpic);
