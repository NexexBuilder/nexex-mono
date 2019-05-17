import BigNumber from 'bignumber.js';
import {ERC20Token} from '@nexex/types';
import {AmountUnit} from '../constants';
import {CommonOrder} from '../types';
import {Amount} from './Amount';

// export function calcQuoteTokenAmount(targetBaseTokenAmount: Amount, baseToken: ERC20Token, quoteToken: ERC20Token, order: CommonOrder) {
//     let baseTokenAmount, quoteTokenAmount;
//     if (order.makerTokenAddress.toLowerCase() === baseToken.addr.toLowerCase()) {
//         baseTokenAmount = order.makerTokenAmount;
//         quoteTokenAmount = order.takerTokenAmount;
//     } else {
//         quoteTokenAmount = order.makerTokenAmount;
//         baseTokenAmount = order.takerTokenAmount;
//     }
//     //the bignumber from 0x's order is old and don't support decimalPlaces method.
//     return new Amount(new BigNumber(quoteTokenAmount.toString(10)).times(targetBaseTokenAmount.toWei()).div(baseTokenAmount)
//         .decimalPlaces(0, BigNumber.ROUND_DOWN), AmountUnit.WEI, quoteToken.decimals);
// }
