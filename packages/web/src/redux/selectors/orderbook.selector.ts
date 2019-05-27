import BigNumber from 'bignumber.js';
import * as R from 'ramda';
import {createSelector} from 'reselect';
import {FtOrder} from '../../types';
export const getBids = state => state.orderbook.bids;

export const getAsks = state => state.orderbook.asks;


export const getSpread = createSelector(
    getBids,
    getAsks,
    (bids: FtOrder[], asks: FtOrder[]): BigNumber => {
        if (bids.length === 0 || asks.length === 0) {
            return;
        }
        return asks[0].price.minus(bids[0].price);
    }
);

export const getMyOrder = createSelector(
    getBids,
    getAsks,
    state => state.wallet.walletAddr,
    (bids: FtOrder[], asks: FtOrder[], walletAddr): FtOrder[] => {
        if (!walletAddr) {
            return [];
        }
        const filterMine = R.filter((order: FtOrder) => order.signedOrder.maker.toLowerCase() === walletAddr.toLowerCase());

        return R.sortBy(R.prop('createdDate'))(R.concat(filterMine(bids), filterMine(asks)));
    }
);
