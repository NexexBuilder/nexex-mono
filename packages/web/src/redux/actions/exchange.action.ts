import {PlainDexOrder, PlainUnsignedOrder} from '@nexex/types';
import {createAction} from 'redux-actions';

export const ExchangeActionType = {
    ORDER_SUBMIT: 'exchange/ORDER_SUBMIT',
    ORDER_SIGNED: 'exchange/ORDER_SIGNED'
};

export const submitOrder = createAction(
    ExchangeActionType.ORDER_SUBMIT,
    (order: PlainUnsignedOrder) => order
);
export type SubmitOrderAction = ReturnType<typeof submitOrder>;

export const orderSigned = createAction(
    ExchangeActionType.ORDER_SIGNED,
    (order: PlainDexOrder) => order
);
export type SignedOrderAction = ReturnType<typeof orderSigned>;
