import {AnyNumber} from '@nexex/api/types';
import {PlainDexOrder, PlainUnsignedOrder} from '@nexex/types';
import {createAction} from 'redux-actions';
import {FtOrder} from '../../types';

export const ExchangeActionType = {
    ORDER_SUBMIT: 'exchange/ORDER_SUBMIT',
    ORDER_PUBLISHED: 'exchange/ORDER_PUBLISHED',
    ORDER_FILL: 'exchange/ORDER_FILL',
    ORDER_CANCEL: 'exchange/ORDER_CANCEL'
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

export const fillOrder = createAction(
    ExchangeActionType.ORDER_FILL,
    (takerAmount: AnyNumber, order: PlainDexOrder) => ({takerAmount, order})
);
export type OrderFillAction = ReturnType<typeof fillOrder>;

export const cancelOrder = createAction(
    ExchangeActionType.ORDER_CANCEL,
    (order: FtOrder) => order
);
export type OrderCancelAction = ReturnType<typeof cancelOrder>;
