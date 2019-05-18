import {Body, Controller, Get, Header, Inject, Param, Post} from '@nestjs/common';
import {Dex} from '@nexex/api';
import {OrderbookOrder} from '@nexex/types';
import {EventSource, ObEventTypes, OrderbookEvent} from '@nexex/types/orderbook';
import {OrderbookOrderTpl} from '@nexex/types/tpl/orderbook';
import {Deserialize} from 'cerialize';
import {Subject} from 'rxjs';
import {EventsModule} from '../events/events.module';
import {OrderService} from '../order/order.service';
import {OrderbookService} from '../orderbook/orderbook.service';
import {DexOrderPipe} from './order.pipes';

@Controller('v1/order')
export class OrderController {
    constructor(
        private readonly dex: Dex,
        private readonly orderService: OrderService,
        private readonly orderbookService: OrderbookService,
        @Inject(EventsModule.EventSubject) private readonly events$: Subject<OrderbookEvent>
    ) {}

    @Get('/:hash')
    @Header('Access-Control-Allow-Origin', '*')
    async queryOrder(@Param('hash') hash: string): Promise<OrderbookOrder> {
        const order = await this.orderService.findOrder(hash);
        return Deserialize(order, OrderbookOrderTpl);
    }

    @Post()
    async placeLimitOrder(@Body(DexOrderPipe) order: OrderbookOrder): Promise<{result: string}> {
        // broadcasts the event
        this.events$.next({
            type: ObEventTypes.NEW_ORDER_ONBOARD,
            payload: order,
            source: EventSource.SELF
        });
        return {result: 'success'};
    }
}
