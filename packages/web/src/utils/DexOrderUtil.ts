import {OrderbookOrder} from '@nexex/types';
import {Market} from '@nexex/types/orderbook';
import {AmountUnit} from '../constants';
import {FtOrder} from '../types';
import {Amount} from './Amount';

export function convertFtOrder(
    market: Market,
    order: OrderbookOrder
): FtOrder {
    if (order.baseTokenAddress.toLowerCase() !== market.base.addr.toLowerCase() ||
        order.quoteTokenAddress.toLowerCase() !== market.quote.addr.toLowerCase()) {
        throw new Error('order not match instrument');
    }
    return {
        orderHash: order.orderHash,
        remainingBaseTokenAmount: order.remainingBaseTokenAmount
            ? new Amount(
                order.remainingBaseTokenAmount,
                AmountUnit.WEI,
                market.base.decimals
            )
            : undefined,
        remainingQuoteTokenAmount: order.remainingQuoteTokenAmount
            ? new Amount(
                order.remainingQuoteTokenAmount,
                AmountUnit.WEI,
                market.quote.decimals
            )
            : undefined,
        signedOrder: order.signedOrder,
        quoteToken: market.quote,
        baseToken: market.base,
        side: order.side,
        state: order.state,
        createdDate: order.createdDate,
        price: order.price
    };
}

export const bidComparator = (
    left: OrderbookOrder,
    right: OrderbookOrder
): number => right.price.minus(left.price).toNumber();

export const askComparator = (
    left: OrderbookOrder,
    right: OrderbookOrder
): number => left.price.minus(right.price).toNumber();
