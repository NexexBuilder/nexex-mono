import {EthTransaction} from '../../types';

export const getTransactions = (state): Map<string, EthTransaction<any>> => state.ethereum.transactions;
