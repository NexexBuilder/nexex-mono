import {createAction} from 'redux-actions';
import {FtOrder} from '../../types';

export const UserActionType = {
    USER_ORDER_INSERT: 'user/order/insert',
    USER_ORDER_UPDATE: 'user/order/update'
};

export const insertUserOrder = createAction(
    UserActionType.USER_ORDER_INSERT,
    (order: FtOrder) => order
);

export type UserOrderInsertAction = ReturnType<typeof insertUserOrder>;

export const updateUserOrder = createAction(
    UserActionType.USER_ORDER_UPDATE,
    (orders: FtOrder[]) => orders
);

export type UserOrderUpdateAction = ReturnType<typeof updateUserOrder>;
