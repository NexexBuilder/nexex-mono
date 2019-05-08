import BigNumber from 'bignumber.js';
import {OrderState, OrderSide, PlainDexOrder} from '../index';
import {OrderbookOrder} from '../orderbook';
import {bnSerializer, lowerCaseSerializer, orderNormalizeSerializer} from './serializers';
import {autoserialize, autoserializeAs, deserialize, serializeAs} from 'cerialize';

export class OrderbookOrderTpl implements OrderbookOrder {
    @autoserialize
    public orderHash: string;
    @autoserialize
    public side: OrderSide;
    @autoserialize
    public state: OrderState;
    @autoserializeAs(lowerCaseSerializer)
    public baseTokenAddress: string;
    @autoserializeAs(lowerCaseSerializer)
    public quoteTokenAddress: string;
    @autoserializeAs(bnSerializer)
    public remainingBaseTokenAmount: BigNumber;
    @autoserializeAs(bnSerializer)
    public remainingQuoteTokenAmount: BigNumber;
    @autoserialize
    public lastUpdate?: Date;
    @autoserializeAs(bnSerializer)
    public price: BigNumber;
    @autoserialize
    public createdDate: Date;
    @serializeAs(orderNormalizeSerializer)
    @deserialize
    public signedOrder: PlainDexOrder;
}

export class OrderbookTpl {
    @autoserializeAs(OrderbookOrderTpl)
    public bids: OrderbookOrderTpl[];
    @autoserializeAs(OrderbookOrderTpl)
    public asks: OrderbookOrderTpl[];
}
