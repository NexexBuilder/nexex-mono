import {Dex} from '@nexex/api';
import {TransactionResponse} from 'ethers/providers';
import {Action, AnyAction} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {combineLatest, from, merge, Observable, of, OperatorFunction, timer} from 'rxjs';
import {catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {PLUGIN_ACCESS, TransactionStatus} from '../../constants';
import {EpicDependencies, EthTransaction, EthTransactionExtra} from '../../types';
import {getMetamaskProvider} from '../../utils/metamaskUtil';
import {
    detectNetwork,
    receiveTxError,
    receiveTxHash,
    receiveTxReceipt,
    updateInjectedProviderEnabled,
    updatePluginAccess
} from '../actions/ethereum.action';
import {GlobalActionType} from '../actions/global.action';
import {updateWalletAddr} from '../actions/wallet.action';

export const startTimerEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([dexPromise, action$.pipe(ofType<AnyAction>(GlobalActionType.APP_INIT))])
        .pipe(
            mergeMap(([dex, action]) => {
                const loopStream = timer(0, 1000);
                return merge(
                    // loopStream.pipe(...checkInjectedWeb3(state$, dex)),
                    loopStream.pipe(...checkNetwork(state$, dex)),
                    loopStream.pipe(...checkMetamaskStatus(state$, dex)),
                    loopStream.pipe(...checkMetamaskEnabledEpic(state$, dex))
                ) as Observable<AnyAction>;
            })
        );

export const checkPluginAccessEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>
): Observable<Action> =>
    action$.pipe(
        ofType(GlobalActionType.APP_INIT),
        mergeMap(() => {
            if (
                typeof window.ethereum !== 'undefined' ||
                (typeof window.web3 !== 'undefined' &&
                    typeof window.web3.currentProvider !== 'undefined')
            ) {
                return of(updatePluginAccess(PLUGIN_ACCESS.LOCKED));
            } else {
                return of(updatePluginAccess(PLUGIN_ACCESS.NONE));
            }
        })
    );

const checkNetwork = (
    state$,
    dex
): [
    OperatorFunction<any, any>,
    OperatorFunction<any, any>,
    OperatorFunction<any, any>
    ] => [
    withLatestFrom(state$),
    switchMap(async ([, state]) => {
        if (
            typeof window.web3 !== 'undefined' &&
            typeof window.web3.currentProvider !== 'undefined'
        ) {
            const provider = getMetamaskProvider();

            const [pluginNetwork, appNetwork] = [await provider.getNetwork(), await dex.eth.getNetwork()];
            if (pluginNetwork.chainId !== appNetwork.chainId) {
                if (!state.ethereum.isWrongNetwork) {
                    return detectNetwork(pluginNetwork.chainId, true);
                }
            } else {
                if (state.ethereum.pluginNetworkId !== pluginNetwork.chainId) {
                    return detectNetwork(pluginNetwork.chainId, false);
                }
            }
        }
    }),
    filter(action => action !== undefined)
];

// const checkInjectedWeb3 = (state$, dex) => [
//     withLatestFrom(state$),
//     switchMap(([, state]) => {
//         if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
//             if (![PLUGIN_ACCESS.FULL, PLUGIN_ACCESS.LOCKED].includes(state.global.pluginAccess)) {
//                 // dex.setProvider(window.web3.currentProvider);
//                 return of(
//                     // setDexProvider(window.web3.currentProvider),
//                     updatePluginAccess(PLUGIN_ACCESS.LOCKED)
//                 );
//             }
//         } else {
//             if (state.global.pluginAccess !== PLUGIN_ACCESS.NONE) {
//                 //is there a case user can disable metamask without refresh? if yes, we need call setProvider as well
//                 return of(updatePluginAccess(PLUGIN_ACCESS.NONE));
//             }
//         }
//         return EMPTY;
//     }),
//     filter((action) => action !== undefined)
// ];

const checkMetamaskStatus = (
    state$,
    dex
): [
    OperatorFunction<any, any>,
    OperatorFunction<any, any>,
    OperatorFunction<any, any>,
    OperatorFunction<any, any>,
    OperatorFunction<any, any>
    ] => [
    withLatestFrom(state$),
    filter(([, state]) =>
        [PLUGIN_ACCESS.FULL, PLUGIN_ACCESS.LOCKED].includes(
            state.ethereum.pluginAccess
        )
    ),
    switchMap(async ([, state]) => {
        let coinbase;
        try {
            const provider = getMetamaskProvider();
            coinbase = await provider.getSigner().getAddress();
        } catch (e) {
        }
        const {pluginAccess} = state.ethereum;
        if (!coinbase && pluginAccess !== PLUGIN_ACCESS.LOCKED) {
            return [
                updatePluginAccess(PLUGIN_ACCESS.LOCKED),
                updateWalletAddr(coinbase)
            ];
        } else if (coinbase) {
            if (pluginAccess !== PLUGIN_ACCESS.FULL) {
                return [
                    updatePluginAccess(PLUGIN_ACCESS.FULL),
                    updateWalletAddr(coinbase)
                ];
            } else if (state.wallet.walletAddr !== coinbase) {
                return updateWalletAddr(coinbase);
            }
        }
    }),
    filter(action => action !== undefined),
    switchMap((action: AnyAction | AnyAction[]) => {
        if (action instanceof Array) {
            return of(...action);
        } else {
            return of(action);
        }
    })
];

export function fromTransactionEvent<T extends EthTransactionExtra>(
    txPromise: Promise<TransactionResponse>,
    type: string,
    userAddr: string,
    extra: T
) {
    const tx$ = from(txPromise);
    return merge(tx$.pipe(
        map(tx => {
            const ethTx: EthTransaction<T> = {
                type,
                userAddr: userAddr,
                extra,
                status: TransactionStatus.PENDING,
                timestamp: new Date(),
                txHash: tx.hash
            };
            return receiveTxHash(ethTx);
        })
    ), tx$.pipe(
        switchMap(tx => from(tx.wait())),
        map(receipt => {
            if (receipt.status === 0) {
                return receiveTxError(undefined, receipt);
            } else {
                return receiveTxReceipt(receipt);
            }
        }),
        catchError(err => of(receiveTxError(err, undefined)))
    ));
}

export const checkMetamaskEnabledEpic = (
    state$,
    dex: Dex
): [
    OperatorFunction<any, any>,
    OperatorFunction<any, any>,
    OperatorFunction<any, any>,
    OperatorFunction<any, any>
    ] => [
    withLatestFrom(state$),
    filter(([, state]) =>
        [PLUGIN_ACCESS.FULL, PLUGIN_ACCESS.LOCKED].includes(
            state.ethereum.pluginAccess
        )
    ),
    switchMap(async ([, state]) => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = window.ethereum;
            if (
                typeof provider.isEnabled === 'function' &&
                typeof provider.enable === 'function'
            ) {
                const isEnabled = await provider.isEnabled();
                if (state.ethereum.injectedProviderEnabled !== isEnabled) {
                    return updateInjectedProviderEnabled(isEnabled);
                }
            }
        }
    }),
    filter(action => action !== undefined)
];

export const enableMetamaskEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>
): Observable<Action> =>
    action$.pipe(
        ofType(GlobalActionType.APP_INIT),
        filter(() => (
            typeof window.ethereum !== 'undefined' &&
            typeof window.ethereum.isEnabled === 'function' &&
            typeof window.ethereum.enable === 'function'
        )),
        tap(async (action) => {
            const isEnabled = await window.ethereum.isEnabled();
            if (!isEnabled) {
                window.ethereum.enable();
            }
        }),
        filter(() => false)
    );

export default combineEpics(startTimerEpic, checkPluginAccessEpic, enableMetamaskEpic);
