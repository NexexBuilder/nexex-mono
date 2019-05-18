import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {Amount} from '../../utils/Amount';
import {
    UpdateTokenAllowancesAction,
    UpdateTokenBalanceAction,
    UpdateTokenBalancesAction,
    UpdateWalletAddrAction,
    WalletActionType
} from '../actions/wallet.action';

export interface WalletState {
    walletAddr?: string;
    walletBalance: { [symbol: string]: Amount };
    tokenAllowances: { [symbol: string]: Amount };
}

const defaultState: WalletState = {
    walletBalance: {},
    tokenAllowances: {},
};

export default handleActions<WalletState, any>(
    {
        [WalletActionType.WALLET_ADDR_UPDATE]:
            (state, action: UpdateWalletAddrAction) =>
                update(state, {$merge: {walletAddr: action.payload}})
        ,
        [WalletActionType.TOKEN_BALANCE_UPDATE]:
            (state, action: UpdateTokenBalanceAction) =>
                update(state, {walletBalance: {$merge: {[action.payload.tokenSymbol]: action.payload.balance}}})
        ,
        [WalletActionType.TOKEN_BALANCES_UPDATE]:
            (state, action: UpdateTokenBalancesAction) =>
                update(state, {walletBalance: {$merge: action.payload}})
        ,
        [WalletActionType.TOKEN_ALLOWANCES_UPDATE]:
            (state, action: UpdateTokenAllowancesAction) =>
                update(state, {tokenAllowances: {$merge: action.payload}})

    }, defaultState
);
