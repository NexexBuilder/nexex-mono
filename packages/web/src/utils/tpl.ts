import {ERC20Token, OrderSide, OrderState, PlainDexOrder} from '@nexex/types';
import {bnSerializer} from '@nexex/types/tpl/serializers';
import BigNumber from 'bignumber.js';
import {autoserialize, autoserializeAs} from 'cerialize';
import {AmountUnit} from '../constants';
import {FtOrder} from '../types';
import {Amount} from './Amount';

export const amountSerializer = {
    Serialize(val: Amount) {
        return {value: val.toWei().toString(10), decimals: val.decimals};
    },
    Deserialize(val): Amount {
        return new Amount(val.value, AmountUnit.WEI, val.decimals);
    }
};

export class FtOrderTpl implements FtOrder{
    @autoserialize
    baseToken: ERC20Token;
    @autoserialize
    createdDate: Date;
    @autoserialize
    lastUpdate: Date;
    @autoserialize
    orderHash: string;
    @autoserializeAs(bnSerializer)
    price: BigNumber;
    @autoserialize
    quoteToken: ERC20Token;
    @autoserializeAs(amountSerializer)
    remainingBaseTokenAmount: Amount;
    @autoserializeAs(amountSerializer)
    remainingQuoteTokenAmount: Amount;
    @autoserialize
    side: OrderSide;
    @autoserialize
    signedOrder: PlainDexOrder;
    @autoserialize
    state: OrderState;
    @autoserializeAs(amountSerializer)
    baseTokenAmount: Amount;
    @autoserializeAs(amountSerializer)
    quoteTokenAmount: Amount;
}
