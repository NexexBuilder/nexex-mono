import {Module} from '@nestjs/common';
import {EventsModule} from '../events/events.module';
import {OrderModule} from '../order/order.module';
import {OrderbookService} from './orderbook.service';
import * as handlers from './orderbook.handler';

@Module({
    imports: [EventsModule, OrderModule],
    providers: [OrderbookService, ...Object.values(handlers)],
    exports: [OrderbookService]
})
export class OrderbookModule {}
