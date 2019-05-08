import {Module} from '@nestjs/common';
import {EventsModule} from '../events/events.module';
import {OrderModule} from '../order/order.module';
import {OrderbookModule} from '../orderbook/orderbook.module';
import {MarketController} from './market.controller';
import {OrderController} from './order.controller';
import {DexOrderPipe} from './order.pipes';

@Module({
    controllers: [OrderController, MarketController],
    imports: [OrderModule, OrderbookModule, EventsModule],
    providers: [DexOrderPipe]
})
export class RestModule {}
