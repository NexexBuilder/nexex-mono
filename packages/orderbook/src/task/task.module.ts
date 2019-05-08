import {Module} from '@nestjs/common';
import {EventsModule} from '../events/events.module';
import {GlobalModule} from '../global/global.module';
import {OrderModule} from '../order/order.module';
import {OrderbookModule} from '../orderbook/orderbook.module';
import {ZeromqModule} from '../zeromq/zeromq.module';
import {OrderTask} from './order.task';

@Module({
    imports: [GlobalModule, EventsModule, OrderbookModule, OrderModule, ZeromqModule],
    providers: [OrderTask],
    exports: []
})
export class TaskModule {}
