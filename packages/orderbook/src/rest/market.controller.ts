import {Controller, Get, Header, HttpException, HttpStatus, Inject, Param, Query} from '@nestjs/common';
import {Dex} from '@nexex/api';
import {OrderSide} from '@nexex/types';
import {Market, MarketConfig, OrderbookEvent} from '@nexex/types/orderbook';
import {OrderAggregateTpl, OrderbookAggregateTpl} from '@nexex/types/tpl/orderbook';
import {Serialize} from 'cerialize';
import {ethers} from 'ethers';
import {getAddress} from 'ethers/utils';
import {Subject} from 'rxjs';
import {EventsModule} from '../events/events.module';
import {ObConfig} from '../global/global.model';
import {OrderbookService} from '../orderbook/orderbook.service';

@Controller('v1/market')
export class MarketController {
    constructor(
        private readonly dex: Dex,
        private readonly orderbookService: OrderbookService,
        private config: ObConfig,
        @Inject(EventsModule.EventSubject) private readonly events$: Subject<OrderbookEvent>
    ) {}

    @Get('/:market/config')
    @Header('Access-Control-Allow-Origin', '*')
    makerRecipient(): MarketConfig {
        return this.config.marketDefault;
    }

    @Get('')
    @Header('Access-Control-Allow-Origin', '*')
    queryMarkets(): Promise<Market[]> {
        return this.orderbookService.getMarkets();
    }

    @Get('/:market')
    @Header('Access-Control-Allow-Origin', '*')
    async queryOrders(
        @Param('market') market: string,
        @Query('limit') _limit = '40',
        @Query('decimals') _decimals = '5'
    ): Promise<any> {
        const [baseName, quoteName] = market.split('-');
        const [baseAddress, quoteAddress] = await Promise.all([
            this.getTokenAddress(baseName),
            this.getTokenAddress(quoteName)
        ]);
        const limit = Number(_limit);
        const decimals = Number(_decimals);
        try{
            const slicedOb = await this.orderbookService.topOrders(`${baseAddress}-${quoteAddress}`, limit, decimals);
            const serialized = Serialize(slicedOb, OrderbookAggregateTpl);
            return serialized;
        }catch (e) {
            throw new HttpException('Orderbook not found', HttpStatus.NOT_FOUND);
        }
    }

    @Get('/:market/:side/:price')
    @Header('Access-Control-Allow-Origin', '*')
    async queryOrderByPrice(
        @Param('market') market: string,
        @Param('side') side: string,
        @Param('price') price: string,
        @Query('decimals') _decimals = '5'
    ): Promise<any> {
        const [baseName, quoteName] = market.split('-');
        const [baseAddress, quoteAddress] = await Promise.all([
            this.getTokenAddress(baseName),
            this.getTokenAddress(quoteName)
        ]);
        const decimals = Number(_decimals);
        try{
            const orderAg = await this.orderbookService.queryOrderAggregateByPrice(`${baseAddress}-${quoteAddress}`, OrderSide[side], price, decimals);
            const serialized = Serialize(orderAg, OrderAggregateTpl);
            return serialized;
        }catch (e) {
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
