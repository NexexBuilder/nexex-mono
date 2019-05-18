import {Action} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {Observable} from 'rxjs/internal/Observable';
import {mergeMap} from 'rxjs/operators';
import {EpicDependencies} from '../../types';
import {getMetamaskSigner} from '../../utils/metamaskUtil';
import {
    ExchangeActionType,
    orderSigned,
    SubmitOrderAction
} from '../actions/exchange.action';

export const submitOrderEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType(ExchangeActionType.ORDER_SUBMIT),
        mergeMap(async (action: SubmitOrderAction) => {
            const order = action.payload;
            const dex = await dexPromise;
            order.exchangeContractAddress = await dex.exchange.getContractAddress();
            const signed = await dex.signOrder(getMetamaskSigner(), order);
            return orderSigned(signed);
        })
    );

export default combineEpics(submitOrderEpic);