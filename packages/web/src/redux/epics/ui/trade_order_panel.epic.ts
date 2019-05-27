import {AnyAction} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {Observable} from 'rxjs/internal/Observable';
import {of} from 'rxjs/internal/observable/of';
import {mergeMap, withLatestFrom} from 'rxjs/operators';
import {
    OrderBookWidgetActionType,
    SelectOrderAction
} from '../../actions/ui/orderbook_widget.action';
import {
    TradeOrderPanelActionType,
    UpdateFormAmountAction,
    updateFormData
} from '../../actions/ui/trade_order_panel.action';
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
                quoteTokenAmount: order.remainingQuoteTokenAmount,
                isDirty: false
            };
            return of(updateFormData(form));
        })
    );

const handleAmountChanged = (
    action$: Observable<AnyAction>,
    state$: StateObservable<any>
): Observable<AnyAction> =>
    action$.pipe(
        ofType(TradeOrderPanelActionType.FORM_AMOUNT_UPDATE),
        withLatestFrom(state$),
        mergeMap(([action, state]) => {
            const baseTokenAmount = (action as UpdateFormAmountAction).payload;
            const {selectedOrder} = state.ui.orderbookWidget;
            const form: TradeOrderPanelForm = {
                baseTokenAmount,
                quoteTokenAmount: baseTokenAmount.times(selectedOrder.price),
                isDirty: true
            };
            return of(updateFormData(form));
        })
    );

export default combineEpics(handleOrderSelected, handleAmountChanged);
