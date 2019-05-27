import Bluebird from 'bluebird';
import {Action, AnyAction} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {combineLatest, from, Observable} from 'rxjs';
import {filter, mergeMap, skipUntil, withLatestFrom} from 'rxjs/operators';
import {AmountUnit} from '../../constants';
import {EpicDependencies} from '../../types';
import {Amount} from '../../utils/Amount';
import {getMetamaskSigner} from '../../utils/metamaskUtil';
import {EthereumActionType} from '../actions/ethereum.action';
import {GlobalActionType} from '../actions/global.action';
import {
    ApproveTokenAction,
    ETHUnwrapAction,
    ETHWrapAction,
    RevokeApproveTokenAction,
    updateTokenAllowances,
    updateTokenBalances,
    WalletActionType
} from '../actions/wallet.action';
import {GlobalState} from '../reducers/global.reducer';
import {WalletState} from '../reducers/wallet.reducer';
import {fromTransactionEvent} from './ethereum.epic';

const updateBalanceEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType<AnyAction>(
            WalletActionType.WALLET_ADDR_UPDATE,
            GlobalActionType.MARKET_SELECTED,
            EthereumActionType.BLOCKNUMBER_UPDATE
        ),
        skipUntil(action$.pipe(ofType(GlobalActionType.MARKET_SELECTED))),
        withLatestFrom(state$),
        filter(([, state]: any) => state.wallet.walletAddr),
        mergeMap(async ([, state]) => {
            const {selectedMarket} = state.global as GlobalState;
            const {walletAddr, walletBalance} = state.wallet as WalletState;
            const dex = await dexPromise;
            const [baseTokenBalance, quoteTokenBalance, ethBalance] = [
                await dex.token.balanceOf(
                        selectedMarket.base.addr.toLowerCase(),
                        walletAddr
                ).catch(() => null),
                await dex.token.balanceOf(
                        selectedMarket.quote.addr.toLowerCase(),
                        walletAddr
                ).catch(() => null),
                await Bluebird.resolve(dex.eth.getBalance(walletAddr)).catch(
                    () => null
                )
            ];
            const result: {[token: string]: Amount} = {};
            if (
                baseTokenBalance &&
                (!walletBalance[selectedMarket.base.symbol] ||
                    !walletBalance[selectedMarket.base.symbol]
                        .toWei()
                        .eq(baseTokenBalance))
            ) {
                result[selectedMarket.base.symbol] = new Amount(
                    baseTokenBalance,
                    AmountUnit.WEI,
                    selectedMarket.base.decimals
                );
            }
            if (
                quoteTokenBalance &&
                (!walletBalance[selectedMarket.quote.symbol] ||
                    !walletBalance[selectedMarket.quote.symbol]
                        .toWei()
                        .eq(quoteTokenBalance))
            ) {
                result[selectedMarket.quote.symbol] = new Amount(
                    quoteTokenBalance,
                    AmountUnit.WEI,
                    selectedMarket.base.decimals
                );
            }
            if (
                ethBalance &&
                (!walletBalance.ETH ||
                    !walletBalance.ETH.toWei().eq(ethBalance))
            ) {
                result.ETH = new Amount(ethBalance, AmountUnit.WEI, 18);
            }
            if (Object.keys(result).length > 0) {
                return updateTokenBalances(result);
            }
        }),
        filter(action => action !== undefined)
    );

const updateAllowanceEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType<AnyAction>(
            WalletActionType.WALLET_ADDR_UPDATE,
            GlobalActionType.MARKET_SELECTED,
            EthereumActionType.BLOCKNUMBER_UPDATE
        ),
        skipUntil(action$.pipe(ofType(GlobalActionType.MARKET_SELECTED))),
        withLatestFrom(state$),
        filter(([, state]: any) => state.wallet.walletAddr),
        mergeMap(async ([, state]) => {
            const {selectedMarket} = state.global as GlobalState;
            const {walletAddr} = state.wallet as WalletState;
            const dex = await dexPromise;
            const [baseTokenAllowance, quoteTokenAllowance] = [
                await dex.token.allowanceForGateway(
                    selectedMarket.base.addr.toLowerCase(),
                    walletAddr
                ).catch(() => null),
                await dex.token.allowanceForGateway(
                    selectedMarket.quote.addr.toLowerCase(),
                    walletAddr
                ).catch(() => null)
            ];
            const result = {};
            if (baseTokenAllowance) {
                result[selectedMarket.base.symbol] = new Amount(
                    baseTokenAllowance,
                    AmountUnit.WEI,
                    selectedMarket.base.decimals
                );
            }
            if (quoteTokenAllowance) {
                result[selectedMarket.quote.symbol] = new Amount(
                    quoteTokenAllowance,
                    AmountUnit.WEI,
                    selectedMarket.base.decimals
                );
            }
            return updateTokenAllowances(result);
        })
    );

const handleETHWrapEpic = (
    action$: Observable<ETHWrapAction>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        from(dexPromise), action$.pipe(ofType<AnyAction>(WalletActionType.ETH_WRAP))
    ]).pipe(
        mergeMap(([dex, action]) => {
            const tx = dex.token.wrapEth(getMetamaskSigner(), action.payload.amount.toWei().toString(10), {
                gasLimit: 250000
            });
            return fromTransactionEvent(tx, 'ETH_WRAP', action.payload.sender, {
                amount: action.payload.amount
            });
        })
    );

const handleETHUnWrapEpic = (
    action$: Observable<ETHUnwrapAction>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<AnyAction> =>
    combineLatest([
        from(dexPromise), action$.pipe(ofType<AnyAction>(WalletActionType.ETH_UNWRAP))
    ]).pipe(
        mergeMap(([dex, action]) => {
            const tx = dex.token.unwrapEth(getMetamaskSigner(), action.payload.amount.toWei().toString(10), {
                gasLimit: 250000
            });
            return fromTransactionEvent(tx, 'ETH_UNWRAP', action.payload.sender, {
                amount: action.payload.amount
            });
        })
    );

const handleApproveTokenEpic = (
    action$: Observable<ApproveTokenAction>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        from(dexPromise), action$.pipe(ofType<AnyAction>(WalletActionType.TOKEN_APPROVE))
    ]).pipe(
        mergeMap(([dex, action]) => {
            const tx = dex.token.approveGateway(getMetamaskSigner(), action.payload.token.addr, {
                gasLimit: 250000
            });
            return fromTransactionEvent(tx, 'TOKEN_APPROVE', action.payload.sender, {token: action.payload.token});
        })
    );

const handleRevokeApproveTokenEpic = (
    action$: Observable<RevokeApproveTokenAction>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        from(dexPromise), action$.pipe(ofType<AnyAction>(WalletActionType.TOKEN_APPROVE_REVOKE))
    ]).pipe(
        mergeMap(([dex, action]) => {
            const tx = dex.token.revokeGatewayApproval(getMetamaskSigner(), action.payload.token.addr, {
                gasLimit: 250000
            });
            return fromTransactionEvent(tx, 'TOKEN_APPROVE_REVOKE', action.payload.sender, {token: action.payload.token});
        })
    );

export default combineEpics(
    updateBalanceEpic,
    updateAllowanceEpic,
    handleETHWrapEpic,
    handleETHUnWrapEpic,
    handleApproveTokenEpic,
    handleRevokeApproveTokenEpic
);
