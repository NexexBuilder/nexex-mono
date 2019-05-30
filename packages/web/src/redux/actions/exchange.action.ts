import {AnyNumber} from '@nexex/api/types';
import {PlainDexOrder, PlainUnsignedOrder} from '@nexex/types';
import {Market} from '@nexex/types/orderbook';
import {createAction} from 'redux-actions';
import {FtOrder, LogFillEvent} from '../../types';

export const ExchangeActionType = {
    ORDER_SUBMIT: 'exchange/ORDER_SUBMIT',
    ORDER_PUBLISHED: 'exchange/ORDER_PUBLISHED',
    ORDER_FILL: 'exchange/ORDER_FILL',
    ORDER_CANCEL: 'exchange/ORDER_CANCEL',
    EVENT_SYNC: 'exchange/event/SYNC',
    EVENT_SYNC_FINISH: 'exchange/event/SYNC_FINISH',
    EVENT_MERGE: 'exchange/event/MERGE',
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

export interface SyncEventTask {
    market: Market;
    startBlock: number;
    endBlock: number;
    currentBlock: number;
    batch: number;
}

export const syncEvent = createAction(
    ExchangeActionType.EVENT_SYNC,
    (syncTask: SyncEventTask) => syncTask
);
export type EventSyncAction = ReturnType<typeof syncEvent>;

export const mergeEvents = createAction(
    ExchangeActionType.EVENT_MERGE,
    (marketId: string, events: LogFillEvent[]) => ({events, marketId})
);
export type EventMergeAction = ReturnType<typeof mergeEvents>;

export const finishSyncEvents = createAction(
    ExchangeActionType.EVENT_SYNC_FINISH,
    (marketId: string, startBlock: number) => ({marketId, startBlock})
);
export type EventSyncFinishAction = ReturnType<typeof finishSyncEvents>;
