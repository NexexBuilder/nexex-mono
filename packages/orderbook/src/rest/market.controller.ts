import {Controller, Get, Header, HttpException, HttpStatus, Inject, Param, Query} from '@nestjs/common';
import {Dex} from '@nexex/api';
import {MarketConfig, ObConfig} from '../global/global.model';
import {OrderbookEvent} from '@nexex/types/orderbook';
import {OrderbookTpl} from '@nexex/types/tpl/orderbook';
import {Serialize} from 'cerialize';
import {ethers} from 'ethers';
import {getAddress} from 'ethers/utils';
import R from 'ramda';
import {Subject} from 'rxjs';
import {EventsModule} from '../events/events.module';
import {MarketDetail, OrderbookService} from '../orderbook/orderbook.service';

@Controller('v1/market')
export class MarketController {
    constructor(
        private readonly dex: Dex,
        private readonly orderbookService: OrderbookService,
        private config: ObConfig,
        @Inject(EventsModule.EventSubject) private readonly events$: Subject<OrderbookEvent>
    ) {}

    @Get('/:market/summary')
    @Header('Access-Control-Allow-Origin', '*')
    makerRecipient(): MarketConfig {
        return this.config.marketDefault;
    }

    @Get('')
    @Header('Access-Control-Allow-Origin', '*')
    queryMarkets(): Promise<MarketDetail[]> {
        return this.orderbookService.getMarkets();
    }

    @Get('/:market')
    @Header('Access-Control-Allow-Origin', '*')
    async queryMarketOrders(
        @Param('market') market: string,
        @Query('limit') limit = '40',
        @Query('minimal') minimal = 'true'
    ): Promise<any> {
        const [baseName, quoteName] = market.split('-');
        return this.queryOrders(baseName, quoteName, limit, minimal);
    }

    @Get('/:baseName/:quoteName')
    @Header('Access-Control-Allow-Origin', '*')
    async queryOrders(
        @Param('baseName') baseName: string,
        @Param('quoteName') quoteName: string,
        @Query('limit') _limit = '40',
        @Query('minimal') _minimal = 'true'
    ): Promise<any> {
        const [baseAddress, quoteAddress] = await Promise.all([
            this.getTokenAddress(baseName),
            this.getTokenAddress(quoteName)
        ]);
        const limit = Number(_limit);
        const minimal = _minimal.toLowerCase() !== 'false';
        const ob = this.orderbookService.getOrderbook(baseAddress, quoteAddress);
        const fn = minimal
            ? R.compose(
                  R.project(['orderHash', 'price', 'remainingBaseTokenAmount', 'remainingQuoteTokenAmount']),
                  R.slice(0, limit)
              )
            : R.slice(0, limit);
        if (ob) {
            const slicedOb = {
                bids: fn(ob.bids.array),
                asks: fn(ob.asks.array)
            };
            const serialized = Serialize(slicedOb, OrderbookTpl);
            return serialized;
        } else {
            throw new HttpException('Orderbook not found', HttpStatus.NOT_FOUND);
        }
    }

    private async getTokenAddress(nameOrAddress: string): Promise<string> {
        if (ethers.utils.isHexString(nameOrAddress)) {
            return getAddress(nameOrAddress);
        }
        return this.dex.tokenRegistry.getTokenAddressBySymbol(nameOrAddress);
    }
}
