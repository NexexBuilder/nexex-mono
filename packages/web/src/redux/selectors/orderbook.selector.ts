import {PlainDexOrder} from '@nexex/types/index';
import BigNumber from 'bignumber.js';
import * as R from 'ramda';
import {createSelector} from 'reselect';
import {FtOrder, FtOrderAggregate} from '../../types';
import {OrderbookState} from '../reducers/orderbook.reducer';
import {UserState} from '../reducers/user.reducer';
import {getSelectedMarket} from './index';
export const getBids = state => (state.orderbook as OrderbookState).bids;

export const getAsks = state => (state.orderbook as OrderbookState).asks;


export const getSpread = createSelector(
    getBids,
    getAsks,
    (bids, asks): BigNumber => {
        if (bids.length === 0 || asks.length === 0) {
            return;
        }
        return asks[0].price.minus(bids[0].price);
    }
);

const userOrders = (state) => (state.user as UserState).orders;

export const getMyOrder = createSelector(
    userOrders,
    getSelectedMarket,
    state => state.wallet.walletAddr,
    (orders, market, walletAddr): FtOrder[] => {
        if (!walletAddr) {
            return [];
        }
        return R.compose(
            R.sortBy(R.prop('expirationUnixTimestampSec')),
            R.filter<FtOrder, 'array'>((order: FtOrder) =>
                order.signedOrder.maker.toLowerCase() === walletAddr.toLowerCase() &&
                market.marketId === `${order.baseToken.addr.toLowerCase()}-${order.quoteToken.addr.toLowerCase()}`
            )
        )(orders);
    }
);
