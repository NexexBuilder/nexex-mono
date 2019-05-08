import {Module} from '@nestjs/common';
import {EventsModule} from '../events/events.module';
import {OrderModule} from '../order/order.module';
import {OrderbookService} from './orderbook.service';
import {NewOrderFromPeerHandler, ObNewOrderHandler, OrderDelistHandler, OrderUpdateHandler} from './orderbook.handler';

@Module({
    imports: [EventsModule, OrderModule],
    providers: [OrderbookService, ObNewOrderHandler, NewOrderFromPeerHandler, OrderUpdateHandler, OrderDelistHandler],
    exports: [OrderbookService]
})
export class OrderbookModule {}
