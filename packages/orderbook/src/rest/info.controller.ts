import {Controller, Get, Header, Inject} from '@nestjs/common';
import {EventsModule} from '@nexex/orderbook/events/events.module';
import {ObConfig} from '@nexex/orderbook/global/global.model';
import {OrderbookEvent} from '@nexex/types/orderbook';
import {Subject} from 'rxjs';

@Controller('v1/info')
export class InfoController {
    constructor(
        private config: ObConfig,
        @Inject(EventsModule.EventSubject) private readonly events$: Subject<OrderbookEvent>
    ) {
    }

    @Get('')
    @Header('Access-Control-Allow-Origin', '*')
    info() {
        return {network: this.config.dexConfig.network};
    }
}
