import {createAction} from 'redux-actions';
import {FtOrderAggregate} from '../../../types';

export enum OrderBookWidgetActionType {
    ORDER_SELECT = 'orderbook_widget/ORDER_SELECT',
    ORDER_DESELECT = 'orderbook_widget/ORDER_DESELECT',
}

export const selectOrder = createAction(OrderBookWidgetActionType.ORDER_SELECT,
    (order: FtOrderAggregate) => order);
export type SelectOrderAction = ReturnType<typeof selectOrder>;

export const deselectOrder = createAction(OrderBookWidgetActionType.ORDER_DESELECT);
