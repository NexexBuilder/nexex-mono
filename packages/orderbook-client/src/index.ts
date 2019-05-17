import {ERC20Token} from '@nexex/types';

export {OrderbookWsClient} from './client';

export interface OrderbookWsClientConfig {
    url: string;
}

export interface Market {
    marketId: string;
    base: ERC20Token;
    quote: ERC20Token;
}
