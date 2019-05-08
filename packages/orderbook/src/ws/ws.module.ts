import {Module} from '@nestjs/common';
import {EventsModule} from '../events/events.module';
import {WsNewOrderHandler, WsUpdateOrderHandler} from './handlers/ws.orderbook.handler';
import {WsGateway} from './ws.gateway';

@Module({
    imports: [EventsModule],
    providers: [WsGateway, WsNewOrderHandler, WsUpdateOrderHandler],
    exports: []
})
export class WsModule {}
