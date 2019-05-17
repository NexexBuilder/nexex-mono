import {AnyAction} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {Observable} from 'rxjs/internal/Observable';
import {of} from 'rxjs/internal/observable/of';
import {mergeMap} from 'rxjs/operators';
import {
    OrderBookWidgetActionType,
    SelectOrderAction
} from '../../actions/ui/orderbook_widget.action';
import {updateFormData} from '../../actions/ui/trade_order_panel.action';
import {TradeOrderPanelForm} from '../../reducers/ui/trade_order_panel.reducer';

const handleOrderSelected = (
    action$: Observable<AnyAction>,
    state$: StateObservable<any>
): Observable<AnyAction> =>
    action$.pipe(
        ofType(OrderBookWidgetActionType.ORDER_SELECT),
        mergeMap((action: SelectOrderAction) => {
            const order = action.payload;
            const form: TradeOrderPanelForm = {
                baseTokenAmount: order.remainingBaseTokenAmount,
                quoteTokenAmount: order.remainingQuoteTokenAmount
            };
            return of(updateFormData(form));
        })
    );

export default combineEpics(handleOrderSelected);
