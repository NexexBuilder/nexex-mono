import {Module} from '@nestjs/common';
import {EventsModule} from '../events/events.module';
import * as handlers from './order.handler';
import {OrderService} from './order.service';
import {DatabaseModule} from '../database/database.module';

@Module({
    imports: [DatabaseModule.forCollection(['orders']), EventsModule],
    providers: [OrderService, ...Object.values(handlers)],
    exports: [OrderService]
})
export class OrderModule {}
