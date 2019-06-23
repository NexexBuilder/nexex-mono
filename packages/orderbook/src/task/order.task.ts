import {Inject, Injectable} from '@nestjs/common';
import {ObEventTypes, OrderbookEvent, OrderbookOrder, UpdateOrderTask} from '@nexex/types';
import {EventSource} from '@nexex/types/orderbook';
import Bluebird from 'bluebird';
import differenceInSeconds from 'date-fns/difference_in_seconds';
import {Subject} from 'rxjs';
import {ObConfig} from '../global/global.model';
import logger from '../logger';
import {OrderbookService} from '../orderbook/orderbook.service';
import {ZeromqTaskGateway} from '../zeromq/zeromq.task.gateway';

const UPDATE_INTERVAL_SECONDS = 30;

const UPDATE_THRESHHOLD = 30;
const UPDATE_WAIT_INTERVAL_SEC = 15;

@Injectable()
export class OrderTask {
    constructor(
        @Inject('EventSubject') private events$: Subject<OrderbookEvent>,
        private readonly orderbookService: OrderbookService,
        private config: ObConfig,
        private zeromqTaskGateway: ZeromqTaskGateway
    ) {
        this.run();
    }

    async run(): Promise<void> {
        while (this.config.isTaskNode || this.config.isAllInOneNode) {
            logger.info('OrderTask run()');
            const obs = this.orderbookService.getOrderbooks();
            const now = new Date();
            for (const ob of obs) {
                logger.info(
                    `OrderTask: ${ob.baseToken.symbol}/${ob.quoteToken.symbol} bids: ${ob.bids.array.length} asks: ${
                        ob.asks.array.length
                        }`
                );
                for (const order of ob.bids.array) {
                    if (!order.lastUpdate || differenceInSeconds(now, order.lastUpdate) > UPDATE_INTERVAL_SECONDS) {
                        this.process(order);
                    }
                }
                for (const order of ob.asks.array) {
                    if (!order.lastUpdate || differenceInSeconds(now, order.lastUpdate) > UPDATE_INTERVAL_SECONDS) {
                        this.process(order);
                    }
                }
            }

            await Bluebird.delay(UPDATE_WAIT_INTERVAL_SEC * 1000);
        }
    }

    private process(order: OrderbookOrder) {
        const event: UpdateOrderTask = {type: ObEventTypes.ORDER_UPDATE_TASK, payload: order, source: EventSource.SELF};
        if (this.config.isAllInOneNode || (this.config.isTaskNode && this.config.isTaskWorker)) {
            this.events$.next(event);
        } else {
            this.zeromqTaskGateway.dispatchTask({...event, source: EventSource.TASK_NODE});
        }
    }
}
