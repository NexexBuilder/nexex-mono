import {createAction} from 'redux-actions';
import {Amount} from '../../../utils/Amount';
import {TradeOrderPanelForm} from '../../reducers/ui/trade_order_panel.reducer';

export enum TradeOrderPanelActionType {
    FORM_AMOUNT_UPDATE = 'trade_order_panel/FORM_AMOUNT_UPDATE',
    FORM_DATA_UPDATE = 'trade_order_panel/FORM_DATA_UPDATE',
}

export const updateFormAmount = createAction(TradeOrderPanelActionType.FORM_AMOUNT_UPDATE,
    (value: Amount) => value);
export type UpdateFormAmountAction = ReturnType<typeof updateFormAmount>;

export const updateFormData = createAction(TradeOrderPanelActionType.FORM_DATA_UPDATE,
    (formData: TradeOrderPanelForm) => formData);
export type UpdateFormDataAction = ReturnType<typeof updateFormData>;
