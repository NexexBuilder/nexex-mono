import {Dex} from '@nexex/api';
import {Action, AnyAction} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {Observable, merge, of, timer, combineLatest} from 'rxjs';
import {filter, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {PLUGIN_ACCESS, TransactionStatus} from '../../constants';
import {EpicDependencies, EthTransaction, EthTransactionExtra} from '../../types';
import {getMetamaskProvider} from '../../utils/metamaskUtil';
import {
    detectNetwork,
    updateInjectedProviderEnabled,
    updatePluginAccess
} from '../actions/ethereum.action';
import {GlobalActionType} from '../actions/global.action';
import {updateWalletAddr} from '../actions/wallet.action';
import {OperatorFunction} from 'rxjs';

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
        } catch (e) {}
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

// export function fromTransactionEvent<T extends EthTransactionExtra>(
//     type: string,
//     userAddr: string,
//     extra: T
// ) {
//     return switchMap<TransactionEvents, AnyAction>(
//         (event: TransactionEvents) => {
//             if (event.type === TransactionEventTypes.TransactionHash) {
//                 const ethTx: EthTransaction<T> = {
//                     type,
//                     userAddr,
//                     extra,
//                     status: TransactionStatus.PENDING,
//                     timestamp: new Date(),
//                     txHash: event.payload
//                 };
//                 return of(receiveTxHash(ethTx));
//             } else if (event.type === TransactionEventTypes.Receipt) {
//                 return of(receiveTxReceipt(event.payload));
//             } else if (event.type === TransactionEventTypes.Confirmation) {
//                 return of(
//                     receiveTxConfirmation(
//                         event.payload.confirmationNumber,
//                         event.payload.receipt
//                     )
//                 );
//             } else if (event.type === TransactionEventTypes.Error) {
//                 return of(
//                     receiveTxError(event.payload.error, event.payload.receipt)
//                 );
//             }
//         }
//     );
// }

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
                if (!isEnabled) {
                    provider.enable();
                }
                if (state.ethereum.injectedProviderEnabled !== isEnabled) {
                    return updateInjectedProviderEnabled(isEnabled);
                }
            }
        }
    }),
    filter(action => action !== undefined)
];

export default combineEpics(startTimerEpic, checkPluginAccessEpic);
