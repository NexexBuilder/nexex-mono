import {OrderSide} from '@nexex/types';
import {createAction} from 'redux-actions';

export enum NewOrderPanelActionType {
    FORM_FIELD_UPDATE = 'new_order_panel/FORM_FIELD_UPDATE'
}

export const updateFormField = createAction(
    NewOrderPanelActionType.FORM_FIELD_UPDATE,
    (side: OrderSide, field: string, value: any) => ({
        side,
        formData: {[field]: value}
    })
);
export type UpdateFormFieldAction = ReturnType<typeof updateFormField>;
