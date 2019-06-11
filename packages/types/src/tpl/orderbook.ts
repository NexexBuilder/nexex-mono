import BigNumber from 'bignumber.js';
import {autoserialize, autoserializeAs, deserialize, serializeAs} from 'cerialize';
import {OrderSide, OrderState, PlainDexOrder} from '../index';
import {OrderAggregate, OrderbookAggregate, OrderbookOrder, OrderSlim} from '../orderbook';
import {bnSerializer, lowerCaseSerializer, orderNormalizeSerializer} from './serializers';

export class OrderbookOrderTpl implements OrderbookOrder {
    @autoserialize
    orderHash: string;
    @autoserialize
    side: OrderSide;
    @autoserialize
    state: OrderState;
    @autoserializeAs(lowerCaseSerializer)
    baseTokenAddress: string;
    @autoserializeAs(lowerCaseSerializer)
    quoteTokenAddress: string;
    @autoserializeAs(bnSerializer)
    remainingBaseTokenAmount: BigNumber;
    @autoserializeAs(bnSerializer)
    remainingQuoteTokenAmount: BigNumber;
    @autoserialize
    lastUpdate?: Date;
    @autoserializeAs(bnSerializer)
    price: BigNumber;
    @autoserialize
    createdDate: Date;
    @serializeAs(orderNormalizeSerializer)
    @deserialize
    signedOrder: PlainDexOrder;
}

export class OrderbookTpl {
    @autoserializeAs(OrderbookOrderTpl)
    bids: OrderbookOrderTpl[];
    @autoserializeAs(OrderbookOrderTpl)
    asks: OrderbookOrderTpl[];
}

export class OrderSlimTpl implements OrderSlim {
    @autoserializeAs(lowerCaseSerializer)
    orderHash: string;
    @autoserializeAs(bnSerializer)
    remainingBaseTokenAmount: BigNumber;
    @autoserializeAs(bnSerializer)
    remainingQuoteTokenAmount: BigNumber;
}

export class OrderAggregateTpl implements OrderAggregate {
    @autoserializeAs(bnSerializer)
    aggregateBaseTokenAmount: BigNumber;
    @autoserializeAs(bnSerializer)
    aggregateQuoteTokenAmount: BigNumber;
    @autoserializeAs(OrderSlimTpl)
    orders: OrderSlim[];
    @autoserializeAs(bnSerializer)
    price: BigNumber;
}

export class OrderbookAggregateTpl implements OrderbookAggregate {
    @autoserializeAs(OrderAggregateTpl)
    asks: OrderAggregate[];
    @autoserializeAs(OrderAggregateTpl)
    bids: OrderAggregate[];
    @autoserialize
    baseToken: string;
    @autoserialize
    quoteToken: string;
}
