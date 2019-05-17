// import mergeSorted from 'merge-k-sorted-arrays';
import BigNumber from 'bignumber.js';
import {createSelector} from 'reselect';
import {FtOrder} from '../../../types';
// import {askComparator, bidComparator} from '../../../utils/DexOrderUtil';

// const getZeroExBids = state => state.orderbook.zeroEx.bids;
export const getBids = state => state.orderbook.bids;

// export const getCombinedBids = createSelector(
//     // getZeroExBids,
//     getUnionExBids,
//     (zeroExBids, unionExBids) =>
//         mergeSorted([zeroExBids, unionExBids], {comparator: bidComparator})
// );

// const getZeroExAsks = state => state.orderbook.zeroEx.asks;
export const getAsks = state => state.orderbook.asks;

// export const getCombinedAsks = createSelector(
//     getZeroExAsks,
//     getUnionExAsks,
//     (zeroExAsks, unionExAsks) =>
//         mergeSorted([zeroExAsks, unionExAsks], {comparator: askComparator})
// );

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
