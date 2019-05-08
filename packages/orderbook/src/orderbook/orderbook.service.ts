import {Inject, Injectable} from '@nestjs/common';
import {Dex, FeeRate, orderUtil} from '@nexex/api';
import {ERC20Token, ObEventTypes, OrderbookEvent, OrderbookOrder, OrderSide, PlainDexOrder} from '@nexex/types';
import BigNumber from 'bignumber.js';
import {ethers} from 'ethers';
import {getAddress} from 'ethers/utils';
import {Subject} from 'rxjs';
import SortedArray from 'sorted-array';
import {EventsModule} from '../events/events.module';
import {ObConfig} from '../global/global.model';
import logger from '../logger';
import {OrderService} from '../order/order.service';
import {bignumberToBignumber} from '../utils/bignumber';
import {localCache} from '../utils/decorators';
import {defer, Defer} from '../utils/defer';
import {fromPlainDexOrder} from '../utils/orderUtil';
import {FailToQueryAvailableVolume, OrderAmountTooSmall, OrderbookNotExist} from './orderbook.error';
import {Orderbook} from './orderbook.types';

export interface MarketDetail {
    base: ERC20Token;
    quote: ERC20Token;
}

@Injectable()
export class OrderbookService {
    private ready: Defer<void>;
    private orderbookMap: {[market: string]: Orderbook} = {};

    constructor(
        private orderService: OrderService,
        private dex: Dex,
        private config: ObConfig,
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>
    ) {
        this.ready = defer();
        this.init().catch(this.ready.reject);
    }

    whenReady(): Promise<void> {
        return this.ready.promise;
    }

    /**
     *
     * @param baseTokenAddr
     * @param quoteTokenAddr
     * @throws error
     */
    getOrderbook(baseTokenAddr: string, quoteTokenAddr: string): Orderbook {
        const key = `${baseTokenAddr}-${quoteTokenAddr}`;
        return this.getOrderbookById(key);
    }

    /**
     *
     * @param marketId
     * @throws error
     */
    getOrderbookById(marketId: string): Orderbook {
        return this.orderbookMap[marketId.toLowerCase()];
    }

    getOrderbooks(): Orderbook[] {
        return Object.values(this.orderbookMap);
    }

    @localCache(12 * 60 * 60 * 1000)
    public async getMarkets(): Promise<MarketDetail[]> {
        await this.whenReady();
        const ret = [];
        for (const marketId of Object.keys(this.orderbookMap)) {
            const [baseAddr, quoteAddr] = marketId.split('-');
            const [base = {symbol: undefined}, quote = {symbol: undefined}] = [
                await this.dex.tokenRegistry.getTokenMetaData(baseAddr),
                await this.dex.tokenRegistry.getTokenMetaData(quoteAddr)
            ];
            ret.push({base: {addr: baseAddr, symbol: base.symbol}, quote: {addr: quoteAddr, symbol: quote.symbol}});
        }
        return ret;
    }

    /**
     *
     * @param order
     * @throws OrderbookNotExist
     */
    addOrder(order: OrderbookOrder): string {
        const market = this.findOrderMarket(order.signedOrder.makerTokenAddress, order.signedOrder.takerTokenAddress);
        if (order.side === OrderSide.BID) {
            market.bids.insert(order);
        } else {
            market.asks.insert(order);
        }
        return `${market.baseToken.addr.toLowerCase()}-${market.quoteToken.addr.toLowerCase()}`;
    }

    findOrderMarket(makerTokenAddress: string, takerTokenAddress: string): Orderbook {
        for (const market of Object.values(this.orderbookMap)) {
            if (
                (market.baseToken.addr.toLowerCase() === makerTokenAddress.toLowerCase() &&
                    market.quoteToken.addr.toLowerCase() === takerTokenAddress.toLowerCase()) ||
                (market.baseToken.addr.toLowerCase() === takerTokenAddress.toLowerCase() &&
                    market.quoteToken.addr.toLowerCase() === makerTokenAddress.toLowerCase())
            ) {
                return market;
            }
        }
        throw new OrderbookNotExist();
    }

    updateBalance(
        marketId: string,
        orderHash: string,
        side: OrderSide,
        baseAmount: BigNumber,
        quoteAmount: BigNumber,
        lastUpdate: Date
    ) {
        const orderbook = this.getOrderbookById(marketId);
        const orders = side === OrderSide.ASK ? orderbook.asks : orderbook.bids;
        const match = orders.array.find(order => order.orderHash === orderHash);
        if (match) {
            match.remainingBaseTokenAmount = baseAmount;
            match.remainingQuoteTokenAmount = quoteAmount;
            match.lastUpdate = lastUpdate;
        }
    }

    delistOrder(marketId: string, orderHash: string, side: OrderSide) {
        const orderbook = this.getOrderbookById(marketId);
        const orders = side === OrderSide.ASK ? orderbook.asks : orderbook.bids;
        const match = orders.array.find(order => order.orderHash === orderHash);
        if (match) {
            orders.remove(match);
        }
    }

    async validateOrder(plainOrder: PlainDexOrder): Promise<OrderbookOrder> {
        if (!orderUtil.isValidOrder(plainOrder)) {
            throw new Error('Order Validation failed');
        }
        if (this.dex.exchange.getContractAddress().toLowerCase() !== plainOrder.exchangeContractAddress.toLowerCase()) {
            throw new Error('Order Validation failed');
        }
        if (plainOrder.makerFeeRecipient.toLowerCase() !== this.config.marketDefault.makerRecipient.toLowerCase()) {
            throw new Error('Order Validation failed, bad makerRecipient');
        }
        const minMakerFeeRate = FeeRate.from(this.config.marketDefault.minMakerFeeRate);
        if (minMakerFeeRate.lt(plainOrder.makerFeeRate)) {
            throw new Error('require more maker fee rate');
        }
        const market = this.findOrderMarket(plainOrder.makerTokenAddress, plainOrder.takerTokenAddress);
        const order = fromPlainDexOrder(market.baseToken, market.quoteToken, plainOrder);
        try {
            const availableVolume = bignumberToBignumber(await this.dex.exchange.availableVolume(order.signedOrder));
            const {makerTokenAmount, takerTokenAmount} = order.signedOrder;
            const availableMakerVolume = availableVolume
                .times(makerTokenAmount)
                .div(takerTokenAmount)
                .decimalPlaces(0, BigNumber.ROUND_DOWN);
            if (order.side === OrderSide.ASK) {
                order.remainingBaseTokenAmount = availableMakerVolume;
                order.remainingQuoteTokenAmount = availableVolume;
            } else {
                order.remainingBaseTokenAmount = availableVolume;
                order.remainingQuoteTokenAmount = availableMakerVolume;
            }
            order.lastUpdate = new Date();
        } catch (e) {
            logger.error(`failed to fetch availableVolume for incomming order: ${order.orderHash}`);
            logger.error(e);
            throw new FailToQueryAvailableVolume();
        }
        const [minOrderBase, minOrderQuote] = [
            await this.dex.token.parseAmount(order.baseTokenAddress, this.config.marketDefault.minOrderBaseVolumn),
            await this.dex.token.parseAmount(order.quoteTokenAddress, this.config.marketDefault.minOrderQuoteVolumn)
        ];
        if (minOrderBase.gt(order.remainingBaseTokenAmount.toString(10))) {
            throw new OrderAmountTooSmall(minOrderBase.toString(), order.remainingBaseTokenAmount.toString(10));
        }
        if (minOrderQuote.gt(order.remainingQuoteTokenAmount.toString(10))) {
            throw new OrderAmountTooSmall(minOrderQuote.toString(), order.remainingQuoteTokenAmount.toString(10));
        }

        return order;
    }

    /**
     * 1) get market list from config
     * 2) load orders of each market from db
     * 3) register listener of ipfs for each market
     */
    protected async init(): Promise<void> {
        logger.info('OrderbookService#init: start');
        const length = this.config.markets.length;
        for (let idx = 0; idx < length; idx++) {
            const marketSymbol = this.config.markets[idx];
            logger.info('OrderbookService#init: %d/%d %s', idx + 1, length, marketSymbol);
            const [baseName, quoteName] = marketSymbol.split('-');
            try {
                const [baseAddress, quoteAddress] = await Promise.all([
                    this.getTokenAddress(baseName),
                    this.getTokenAddress(quoteName)
                ]);
                const baseTokenAddrNormalized = baseAddress.toLowerCase();
                const quoteTokenAddrNormalized = quoteAddress.toLowerCase();
                const marketId = `${baseTokenAddrNormalized}-${quoteTokenAddrNormalized}`;
                // step 2)
                const ob = await this.loadOrderbook(baseTokenAddrNormalized, quoteTokenAddrNormalized);
                this.orderbookMap[marketId] = ob;

                // step 3)
                this.events$.next({
                    type: ObEventTypes.IPFS_SUBSCRIPTION,
                    payload: {
                        marketId
                    }
                });
            } catch (e) {
                logger.error('OrderbookService#init: %s failed', marketSymbol);
                logger.error(e.stack);
            }
        }
        this.ready.resolve();
        logger.info('OrderbookService#init: complete');
    }

    private async loadOrderbook(baseTokenAddress: string, quoteTokenAddress: string): Promise<Orderbook> {
        const [bids, asks] = [
            await this.orderService.loadOrders(baseTokenAddress, quoteTokenAddress, OrderSide.BID),
            await this.orderService.loadOrders(baseTokenAddress, quoteTokenAddress, OrderSide.ASK)
        ];
        const [baseTokenContract, quoteTokenContract] = [
            await this.dex.token.getToken(baseTokenAddress),
            await this.dex.token.getToken(quoteTokenAddress)
        ];
        const sortedBids = new SortedArray(bids, (a, b) =>
            a.price
                .minus(b.price)
                .negated()
                .toNumber()
        );
        const sortedAsks = new SortedArray(asks, (a, b) => a.price.minus(b.price).toNumber());
        return {
            baseToken: baseTokenContract.token,
            quoteToken: quoteTokenContract.token,
            bids: sortedBids,
            asks: sortedAsks
        };
    }

    private async getTokenAddress(nameOrAddress: string): Promise<string> {
        if (ethers.utils.isHexString(nameOrAddress)) {
            return getAddress(nameOrAddress);
        }
        return this.dex.tokenRegistry.getTokenAddressBySymbol(nameOrAddress);
    }
}
