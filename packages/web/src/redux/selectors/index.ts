import {Market} from '@nexex/orderbook-client';
import {createSelector} from 'reselect';
import constants from '../../constants';
import {Amount} from '../../utils/Amount';

export const getSelectedMarket = (store): Market =>
    store.global.selectedMarket;

const getWalletBalances = (store): {[symbol: string]: Amount} =>
    store.wallet.walletBalance;
export const getBaseTokenBalance = createSelector(
    [getSelectedMarket, getWalletBalances],
    (selectedInstrument, walletBalances) => {
        const {base} = selectedInstrument;
        return walletBalances[base.symbol];
    }
);
export const getQuoteTokenBalance = createSelector(
    [getSelectedMarket, getWalletBalances],
    (selectedInstrument, walletBalances) => {
        const {quote} = selectedInstrument;
        return walletBalances[quote.symbol];
    }
);
export const getETHBalance = createSelector(
    [getWalletBalances],
    walletBalances => {
        return walletBalances['ETH'];
    }
);

const getTokenAllowances = (state): Amount => state.wallet.tokenAllowances;

export const getBaseTokenEnableStatus = createSelector(
    [getSelectedMarket, getTokenAllowances],
    (selectedInstrument, allowances) => {
        const {base} = selectedInstrument;
        const allowance = allowances[base.symbol];
        if (allowance) {
            return allowance.toWei().gt(constants.TOKEN_ALLOWANCE_THRESHOLD);
        } else {
            return null;
        }
    }
);

export const getQuoteTokenEnableStatus = createSelector(
    [getSelectedMarket, getTokenAllowances],
    (selectedInstrument, allowances) => {
        const {quote} = selectedInstrument;
        const allowance = allowances[quote.symbol];
        if (allowance) {
            return allowance.toWei().gt(constants.TOKEN_ALLOWANCE_THRESHOLD);
        } else {
            return null;
        }
    }
);

export const getTokenEnableStatus = (tokenSymbol: string) =>
    createSelector([getTokenAllowances], allowances => {
        const allowance = allowances[tokenSymbol];
        if (allowance) {
            return allowance.toWei().gt(constants.TOKEN_ALLOWANCE_THRESHOLD);
        } else {
            return false;
        }
    });

export const getMarketConfigs = (store): Market =>
    store.orderbook.configs;

export const getMarketConfig = createSelector(
    [getSelectedMarket, getMarketConfigs],
    (selectedMarket, configs) => configs[selectedMarket.marketId]
);
