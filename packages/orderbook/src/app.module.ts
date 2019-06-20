import {Module} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {RavenInterceptor} from 'nest-raven';
import {DatabaseModule} from './database/database.module';
import {EventsModule} from './events/events.module';
import {GlobalModule} from './global/global.module';
import {IpfsModule} from './ipfs/ipfs.module';
import {OrderModule} from './order/order.module';
import {OrderbookModule} from './orderbook/orderbook.module';
import {RestModule} from './rest/rest.module';
import {TaskModule} from './task/task.module';
import {WsModule} from './ws/ws.module';
import {ZeromqModule} from './zeromq/zeromq.module';

@Module({
    imports: [
        GlobalModule,
        EventsModule,
        OrderModule,
        OrderbookModule,
        RestModule,
        DatabaseModule,
        IpfsModule,
        WsModule,
        TaskModule,
        ZeromqModule
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useValue: new RavenInterceptor(),
        }
    ]
})
export class AppModule {}
