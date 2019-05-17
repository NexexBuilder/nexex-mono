import {ERC20Token, OrderbookOrder} from '@nexex/types';
import SortedArray from 'sorted-array';

export interface Orderbook {
    baseToken: ERC20Token;
    quoteToken: ERC20Token;
    bids: SortedArray<OrderbookOrder>;
    asks: SortedArray<OrderbookOrder>;
}
