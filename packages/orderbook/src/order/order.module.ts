import {Module} from '@nestjs/common';
import {EventsModule} from '../events/events.module';
import {OrderTaskHandler} from './order.handler';
import {OrderService} from './order.service';
import {DatabaseModule} from '../database/database.module';

@Module({
    imports: [DatabaseModule.forCollection(['orders']), EventsModule],
    providers: [OrderService, OrderTaskHandler],
    exports: [OrderService]
})
export class OrderModule {}
