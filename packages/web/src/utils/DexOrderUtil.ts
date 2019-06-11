import {orderUtil} from '@nexex/api/utils';
import {ERC20Token, OrderbookOrder, OrderSide, OrderState, PlainDexOrder} from '@nexex/types';
import {Market, OrderAggregate} from '@nexex/types/orderbook';
import BigNumber from 'bignumber.js';
import {AmountUnit} from '../constants';
import {FtOrder, FtOrderAggregate} from '../types';
import {Amount} from './Amount';

export function convertFtOrder(
    market: Market,
    order: OrderbookOrder
): FtOrder {
    if (order.baseTokenAddress.toLowerCase() !== market.base.addr.toLowerCase() ||
        order.quoteTokenAddress.toLowerCase() !== market.quote.addr.toLowerCase()) {
        throw new Error('order not match instrument');
    }
    let baseTokenAmount: string, quoteTokenAmount: string;
    if (order.side === OrderSide.BID) {
        baseTokenAmount = order.signedOrder.takerTokenAmount;
        quoteTokenAmount = order.signedOrder.makerTokenAmount;
    } else {
        baseTokenAmount = order.signedOrder.makerTokenAmount;
        quoteTokenAmount = order.signedOrder.takerTokenAmount;
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
        baseTokenAmount: new Amount(baseTokenAmount, AmountUnit.WEI, market.base.decimals),
        remainingQuoteTokenAmount: order.remainingQuoteTokenAmount
            ? new Amount(
                order.remainingQuoteTokenAmount,
                AmountUnit.WEI,
                market.quote.decimals
            )
            : undefined,
        quoteTokenAmount: new Amount(quoteTokenAmount, AmountUnit.WEI, market.quote.decimals),
        signedOrder: order.signedOrder,
        quoteToken: market.quote,
        baseToken: market.base,
        side: order.side,
        state: order.state,
        createdDate: order.createdDate,
        price: order.price
    };
}

export function convertFtOrderAggregate(
    market: Market,
    side: OrderSide,
    order: OrderAggregate
): FtOrderAggregate {
    const [aggregateBaseTokenAmount, aggregateQuoteTokenAmount] =
        order.orders.reduce(([acc1, acc2], order) =>
                [acc1.plus(order.remainingBaseTokenAmount), acc2.plus(order.remainingQuoteTokenAmount)]
            , [new BigNumber(0), new BigNumber(0)]);
    const ftOrder: FtOrderAggregate = {
        price: order.price,
        orders: order.orders,
        quoteToken: market.quote,
        baseToken: market.base,
        side,
        remainingBaseTokenAmount: new Amount(aggregateBaseTokenAmount, AmountUnit.WEI, market.base.decimals),
        remainingQuoteTokenAmount: new Amount(aggregateQuoteTokenAmount, AmountUnit.WEI, market.quote.decimals)
    };
    return ftOrder;
}

export function fromPlainDexOrder(baseToken: ERC20Token, quoteToken: ERC20Token, order: PlainDexOrder): FtOrder {
    const side = order.makerTokenAddress.toLowerCase() === baseToken.addr.toLowerCase() ? OrderSide.ASK : OrderSide.BID;
    const baseAmount =
        side === OrderSide.BID ? new BigNumber(order.takerTokenAmount) : new BigNumber(order.makerTokenAmount);
    const quoteAmount =
        side === OrderSide.ASK ? new BigNumber(order.takerTokenAmount) : new BigNumber(order.makerTokenAmount);
    const price = quoteAmount
        .div(baseAmount)
        .times(10 ** baseToken.decimals)
        .div(10 ** quoteToken.decimals);

    return {
        signedOrder: order,
        baseToken,
        quoteToken,
        price,
        createdDate: new Date(),
        side,
        state: OrderState.OPEN,
        orderHash: orderUtil.getOrderHashHex(order),
        remainingBaseTokenAmount: new Amount(baseAmount, AmountUnit.WEI, baseToken.decimals),
        baseTokenAmount: new Amount(baseAmount, AmountUnit.WEI, baseToken.decimals),
        remainingQuoteTokenAmount: new Amount(quoteAmount, AmountUnit.WEI, quoteToken.decimals),
        quoteTokenAmount: new Amount(quoteAmount, AmountUnit.WEI, quoteToken.decimals)
    };
}

export const bidComparator = (
    left: FtOrderAggregate,
    right: FtOrderAggregate
): number => right.price.minus(left.price).toNumber();

export const askComparator = (
    left: FtOrderAggregate,
    right: FtOrderAggregate
): number => left.price.minus(right.price).toNumber();
