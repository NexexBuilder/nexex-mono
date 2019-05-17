import {OrderbookOrder} from '@nexex/types';
import {AmountUnit} from '../constants';
import {FtOrder} from '../types';
import {Amount} from './Amount';
import {Market} from '@nexex/orderbook-client';

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

// export function convertRadarOrder(
//     instrument: Instrument,
//     order: RadarSignedOrder
// ): FtOrder<OrderSourceType.ZERO_EX> {
//     return {
//         sourceType: OrderSourceType.ZERO_EX,
//         orderHash: order.orderHash,
//         remainingBaseTokenAmount: order.remainingBaseTokenAmount
//             ? new Amount(
//                   order.remainingBaseTokenAmount.toString(10),
//                   AmountUnit.ETHER,
//                   instrument.base.decimals
//               )
//             : undefined,
//         remainingQuoteTokenAmount: order.remainingQuoteTokenAmount
//             ? new Amount(
//                   order.remainingQuoteTokenAmount.toString(10),
//                   AmountUnit.ETHER,
//                   instrument.quote.decimals
//               )
//             : undefined,
//         signedOrder: order.signedOrder,
//         quoteToken: instrument.quote,
//         baseToken: instrument.base,
//         side: order.type === RadarOrderType.ASK ? OrderSide.ASK : OrderSide.BID,
//         state: OrderState[order.state],
//         createdDate: new Date(order.createdDate.toNumber()),
//         price: new BigNumber(order.price.toString(10))
//     };
// }

export const bidComparator = (
    left: OrderbookOrder,
    right: OrderbookOrder
): number => right.price.minus(left.price).toNumber();

export const askComparator = (
    left: OrderbookOrder,
    right: OrderbookOrder
): number => left.price.minus(right.price).toNumber();
