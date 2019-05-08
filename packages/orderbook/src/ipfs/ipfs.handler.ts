import {Inject, Injectable} from '@nestjs/common';
import {orderUtil} from '@nexex/api';
import {EventsModule} from '../events/events.module';
import {IpfsService} from './ipfs.service';
import {OrderbookService} from '../orderbook/orderbook.service';
import {
    EventSource,
    IpfsIncomingEvent,
    IpfsPublishEvent,
    IpfsSubscriptionEvent,
    ObEventTypes,
    OrderbookEvent
} from '@nexex/types/orderbook';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import logger from '../logger';

@Injectable()
export class IpfsSubscriptionHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private ipfsService: IpfsService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.IPFS_SUBSCRIPTION))
            .subscribe((event: IpfsSubscriptionEvent) => this.handle(event));
    }

    async handle(event: IpfsSubscriptionEvent): Promise<void> {
        const {marketId} = event.payload;
        const topic = this.ipfsService.getTopic(marketId);
        logger.info(`ipfs sub: ${topic}`);
        await this.ipfsService.subscribe(topic, orderMsg => {
            logger.info('receive order from ipfs');
            try {
                const plainOrder = JSON.parse(orderMsg.data.toString());
                if (!orderUtil.isValidOrder(plainOrder)) {
                    throw new Error('not valid order');
                }
                this.events$.next({
                    type: ObEventTypes.IPFS_INCOMING,
                    payload: plainOrder
                });
            } catch (e) {
                logger.error('fail to parse order from ipfs', e);
            }
        });
    }
}

@Injectable()
export class IpfsPublishHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private ipfsService: IpfsService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.IPFS_PUBLISH))
            .subscribe((event: IpfsPublishEvent) => this.handle(event));
    }

    async handle(event: IpfsPublishEvent): Promise<void> {
        const {marketId, order} = event.payload;
        const topic = this.ipfsService.getTopic(marketId);
        logger.info(`ipfs pub: ${topic} ${JSON.stringify(order)}`);
        await this.ipfsService.publish(topic, JSON.stringify(order));
    }
}

@Injectable()
export class IpfsIncomingHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.IPFS_INCOMING))
            .subscribe((event: IpfsIncomingEvent) => this.handle(event));
    }

    async handle(event: IpfsIncomingEvent): Promise<void> {
        const {payload: order} = event;
        const obOrder = await this.orderbookService.validateOrder(order);
        this.events$.next({
            type: ObEventTypes.NEW_ORDER_ONBOARD,
            payload: obOrder,
            source: EventSource.IPFS
        });
    }
}
