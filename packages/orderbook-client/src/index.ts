import {ERC20Token, OrderbookOrder} from '@nexex/types';

export {OrderbookWsClient} from './client';

export interface OrderbookWsClientConfig {
    url: string;
}

export interface Orderbook {
    bids: OrderbookOrder[];
    asks: OrderbookOrder[];
}

export interface OrderSlim {
    orderHash: string;
    remainingBaseTokenAmount: string;
    remainingQuoteTokenAmount: string;
    price: string;
}

export interface OrderbookSlim {
    bids: OrderSlim[];
    asks: OrderSlim[];
}

export interface Market {
    marketId: string;
    base: ERC20Token;
    quote: ERC20Token;
}
