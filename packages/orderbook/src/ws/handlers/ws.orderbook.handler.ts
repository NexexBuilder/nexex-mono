import {Inject, Injectable} from '@nestjs/common';
import {
    DownstreamEvent,
    NewOrderAcceptedEvent,
    ObEventTypes,
    OrderbookEvent, OrderUpdateEvent
} from '@nexex/types/orderbook';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {EventsModule} from '../../events/events.module';
import logger from '../../logger';

@Injectable()
export class WsNewOrderHandler {
    constructor(@Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.NEW_ORDER_ACCEPTED))
            .subscribe((event: NewOrderAcceptedEvent) => this.handle(event));
    }

    async handle(event: NewOrderAcceptedEvent): Promise<void> {
        logger.debug('notify ws clients: add order');
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            payload: event,
            to: event.payload.marketId
        } as DownstreamEvent<NewOrderAcceptedEvent>);
    }
}

@Injectable()
export class WsUpdateOrderHandler {
    constructor(@Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.ORDER_BALANCE_UPDATE))
            .subscribe((event: OrderUpdateEvent) => this.handle(event));
    }

    async handle(event: OrderUpdateEvent): Promise<void> {
        logger.debug('notify ws clients: update order');
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            payload: event,
            to: event.payload.marketId
        } as DownstreamEvent<OrderUpdateEvent>);
    }
}
