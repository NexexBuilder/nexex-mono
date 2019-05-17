import {createAction} from 'redux-actions';
import {TradeOrderPanelForm} from '../../reducers/ui/trade_order_panel.reducer';

export enum TradeOrderPanelActionType {
    FORM_FIELD_UPDATE = 'trade_order_panel/FORM_FIELD_UPDATE',
    FORM_DATA_UPDATE = 'trade_order_panel/FORM_DATA_UPDATE',
}

export const updateFormField = createAction(TradeOrderPanelActionType.FORM_FIELD_UPDATE,
    (field: string, value: any) => ({formData: {[field]: value}}));
export type UpdateFormFieldAction = ReturnType<typeof updateFormField>;

export const updateFormData = createAction(TradeOrderPanelActionType.FORM_DATA_UPDATE,
    (formData: TradeOrderPanelForm) => formData);
export type UpdateFormDataAction = ReturnType<typeof updateFormData>;
