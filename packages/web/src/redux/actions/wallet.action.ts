import {ERC20Token} from '@nexex/types';
import {Action, createAction} from 'redux-actions';
import {Amount} from '../../utils/Amount';

export const WalletActionType = {
    WALLET_ADDR_UPDATE: 'wallet/WALLET_ADDR_UPDATE',
    TOKEN_BALANCE_UPDATE: 'wallet/TOKEN_BALANCE_UPDATE',
    TOKEN_BALANCES_UPDATE: 'wallet/TOKEN_BALANCES_UPDATE',
    TOKEN_ALLOWANCES_UPDATE: 'wallet/TOKEN_ALLOWANCES_UPDATE',
    TOKEN_APPROVE: 'wallet/TOKEN_APPROVE',
    TOKEN_APPROVE_REVOKE: 'wallet/TOKEN_APPROVE_REVOKE',
    ETH_WRAP: 'wallet/ETH_WRAP',
    ETH_UNWRAP: 'wallet/ETH_UNWRAP'
};

export const updateWalletAddr = createAction(
    WalletActionType.WALLET_ADDR_UPDATE,
    (addr: string) => addr
);
export type UpdateWalletAddrAction = ReturnType<typeof updateWalletAddr>;

export const updateTokenBalance = createAction(
    WalletActionType.TOKEN_BALANCE_UPDATE,
    (tokenSymbol: string, balance: Amount) => ({tokenSymbol, balance})
);
export type UpdateTokenBalanceAction = ReturnType<typeof updateTokenBalance>;

export const updateTokenBalances = createAction(
    WalletActionType.TOKEN_BALANCES_UPDATE,
    (tokenBalances: {[tokenSymbol: string]: Amount}) => tokenBalances
);
export type UpdateTokenBalancesAction = ReturnType<typeof updateTokenBalances>;

export const updateTokenAllowances = createAction(
    WalletActionType.TOKEN_ALLOWANCES_UPDATE,
    (tokenAllowances: {[tokenSymbol: string]: Amount}) => tokenAllowances
);
export type UpdateTokenAllowancesAction = ReturnType<
    typeof updateTokenAllowances
>;

export const wrapETH = createAction(
    WalletActionType.ETH_WRAP,
    (sender: string, amount: Amount) => ({sender, amount})
);
export type ETHWrapAction = ReturnType<typeof wrapETH>;

export const unwrapETH = createAction(
    WalletActionType.ETH_UNWRAP,
    (sender: string, amount: Amount) => ({sender, amount})
);
export type ETHUnwrapAction = ReturnType<typeof unwrapETH>;

export const approveToken = createAction(
    WalletActionType.TOKEN_APPROVE,
    (sender: string, token: ERC20Token) => ({sender, token})
);
export type ApproveTokenAction = Action<{sender: string; token: ERC20Token}>;

export const revokeApproveToken = createAction(
    WalletActionType.TOKEN_APPROVE_REVOKE,
    (sender: string, token: ERC20Token) => ({sender, token})
);
export type RevokeApproveTokenAction = Action<{
    sender: string;
    token: ERC20Token;
}>;
