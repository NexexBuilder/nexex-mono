import {createAction} from 'redux-actions';
import {FtOrder} from '../../../types';

export enum OrderBookWidgetActionType {
    ORDER_SELECT = 'orderbook_widget/ORDER_SELECT',
}

export const selectOrder = createAction(OrderBookWidgetActionType.ORDER_SELECT,
    (order: FtOrder) => order);
export type SelectOrderAction = ReturnType<typeof selectOrder>;
