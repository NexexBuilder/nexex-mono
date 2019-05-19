import BigNumber from 'bignumber.js';
import {autoserialize, autoserializeAs, deserialize, serializeAs} from 'cerialize';
import {OrderSide, OrderState, PlainDexOrder} from '../index';
import {OrderbookOrder} from '../orderbook';
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
