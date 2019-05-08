import {Module} from '@nestjs/common';
import {OrderbookModule} from '../orderbook/orderbook.module';
import {EventsModule} from '../events/events.module';
import {IpfsIncomingHandler, IpfsPublishHandler, IpfsSubscriptionHandler} from './ipfs.handler';
import {IpfsService} from './ipfs.service';

@Module({
    imports: [EventsModule, OrderbookModule],
    providers: [IpfsService, IpfsIncomingHandler, IpfsPublishHandler, IpfsSubscriptionHandler],
    exports: [IpfsService]
})
export class IpfsModule {}
