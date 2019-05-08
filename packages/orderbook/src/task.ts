import {NestFactory} from '@nestjs/core';
import {argv} from 'yargs';

import {Module} from '@nestjs/common';
import {DatabaseModule} from './database/database.module';
import {EventsModule} from './events/events.module';
import {GlobalModule} from './global/global.module';
import {IpfsModule} from './ipfs/ipfs.module';
import {OrderModule} from './order/order.module';
import {OrderbookModule} from './orderbook/orderbook.module';
import {TaskModule} from './task/task.module';
import {ZeromqModule} from './zeromq/zeromq.module';

@Module({
    imports: [
        GlobalModule,
        EventsModule,
        OrderModule,
        OrderbookModule,
        DatabaseModule,
        ZeromqModule,
        TaskModule,
        IpfsModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = (argv.port as string) || process.env.PORT || 3003;
    await app.listen(port);
}
bootstrap();
