import {createSelector} from 'reselect';
import {TransactionStatus} from '../../../constants';
import {getTransactions} from '../ethereum.selector';
import {getBaseTokenEnableStatus, getQuoteTokenEnableStatus, getSelectedMarket} from '../index';

export const quoteTokenSpin = createSelector(
    [getSelectedMarket, getTransactions, getQuoteTokenEnableStatus],
    (selectedMarket, transactions, quoteTokenEnableStatus) => {
        if (quoteTokenEnableStatus === null){
            return true;
        }
        if (selectedMarket) {
            const {quote} = selectedMarket;
            for (const tx of transactions.values()) {
                if ((tx.type === 'TOKEN_APPROVE' || tx.type === 'TOKEN_APPROVE_REVOKE') &&
                    tx.status === TransactionStatus.PENDING && tx.extra.token.addr === quote.addr) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    }
);

export const baseTokenSpin = createSelector(
    [getSelectedMarket, getTransactions, getBaseTokenEnableStatus],
    (selectedInstrument, transactions, baseTokenEnableStatus) => {
        if (baseTokenEnableStatus === null){
            return true;
        }
        if (selectedInstrument) {
            const {base} = selectedInstrument;
            for (const tx of transactions.values()) {
                if ((tx.type === 'TOKEN_APPROVE' || tx.type === 'TOKEN_APPROVE_REVOKE') &&
                    tx.status === TransactionStatus.PENDING && tx.extra.token.addr === base.addr) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    }
);
