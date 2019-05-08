import {OrderbookOrderTpl} from '@nexex/types/tpl/orderbook';
import BigNumber from 'bignumber.js';
import {ERC20Token, OrderbookOrder, OrderSide, OrderState, PlainDexOrder, SignedOrder} from '@nexex/types';
import {orderUtil} from '@nexex/api';

export function fromPlainDexOrder(baseToken: ERC20Token, quoteToken: ERC20Token, order: PlainDexOrder): OrderbookOrder {
    const side = order.makerTokenAddress.toLowerCase() === baseToken.addr.toLowerCase() ? OrderSide.ASK : OrderSide.BID;
    const baseAmount =
        side === OrderSide.BID ? new BigNumber(order.takerTokenAmount) : new BigNumber(order.makerTokenAmount);
    const quoteAmount =
        side === OrderSide.ASK ? new BigNumber(order.takerTokenAmount) : new BigNumber(order.makerTokenAmount);
    const price = quoteAmount
        .div(baseAmount)
        .times(10 ** baseToken.decimals)
        .div(10 ** quoteToken.decimals);
    const ret = new OrderbookOrderTpl();
    ret.orderHash = orderUtil.getOrderHashHex(order);
    ret.side = side;
    ret.state = OrderState.OPEN;
    ret.baseTokenAddress = baseToken.addr;
    ret.quoteTokenAddress = quoteToken.addr;
    ret.price = price;
    ret.createdDate = new Date();
    ret.signedOrder = order;

    return ret;
}

export function toPlainOrder(order: SignedOrder): PlainDexOrder {
    return {
        maker: order.maker,
        taker: order.taker,
        makerFeeRate: order.makerFeeRate.toString(10),
        takerFeeRate: order.takerFeeRate.toString(10),
        makerTokenAmount: order.makerTokenAmount.toString(10),
        takerTokenAmount: order.takerTokenAmount.toString(10),
        makerTokenAddress: order.makerTokenAddress,
        takerTokenAddress: order.takerTokenAddress,
        salt: order.salt.toString(10),
        exchangeContractAddress: order.exchangeContractAddress,
        makerFeeRecipient: order.makerFeeRecipient,
        expirationUnixTimestampSec: order.expirationUnixTimestampSec.toNumber(),
        ecSignature: order.ecSignature
    };
}
