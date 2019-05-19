import {PlainDexOrder, PlainUnsignedOrder} from '@nexex/types';
import {createAction} from 'redux-actions';

export const ExchangeActionType = {
    ORDER_SUBMIT: 'exchange/ORDER_SUBMIT',
    ORDER_PUBLISHED: 'exchange/ORDER_PUBLISHED'
};

export const submitOrder = createAction(
    ExchangeActionType.ORDER_SUBMIT,
    (order: PlainUnsignedOrder) => order
);
export type SubmitOrderAction = ReturnType<typeof submitOrder>;

export const orderPublished = createAction(
    ExchangeActionType.ORDER_PUBLISHED,
    (order: PlainDexOrder) => order
);
export type PublishOrderAction = ReturnType<typeof orderPublished>;
