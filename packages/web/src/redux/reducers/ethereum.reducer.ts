import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {PLUGIN_ACCESS, TransactionStatus} from '../../constants';
import {EthTransaction} from '../../types';
import {
    EthereumActionType,
    NetworkDetectAction,
    // ReceiveTxConfirmationAction,
    ReceiveTxHashAction,
    // ReceiveTxReceiptAction,
    UpdateBlockNumberAction,
    UpdateInjectedProviderEnabledAction,
    UpdatePluginAccessAction
} from '../actions/ethereum.action';

export interface EthereumState {
    isWrongNetwork: boolean;
    pluginNetworkId?: number;
    pluginAccess?: PLUGIN_ACCESS;
    transactions: Map<string, EthTransaction<any>>;
    injectedProviderEnabled?: boolean;
    blockNumber?: number;
}

const defaultState: EthereumState = {
    isWrongNetwork: false,
    transactions: new Map()
};

export default handleActions<EthereumState, any>(
    {
        [EthereumActionType.BLOCKNUMBER_UPDATE]: (
            state,
            action: UpdateBlockNumberAction
        ) => update(state, {$merge: {blockNumber: action.payload}}),
        [EthereumActionType.PLUGIN_ACCESS_UPDATE]: (
            state,
            action: UpdatePluginAccessAction
        ) => {
            return update(state, {
                pluginAccess: {$set: action.payload}
            });
        },
        [EthereumActionType.INJECTED_PROVIDER_ENABLED_UPDATE]: (
            state,
            action: UpdateInjectedProviderEnabledAction
        ) => {
            return update(state, {
                injectedProviderEnabled: {$set: action.payload}
            });
        },
        [EthereumActionType.NETWORK_DETECTED]: (
            state,
            action: NetworkDetectAction
        ) =>
            update(state, {
                $merge: action.payload
            }),
        [EthereumActionType.TX_TXHASH]: (state, action: ReceiveTxHashAction) =>
            update(state, {
                transactions: {
                    [action.payload.txHash]: {
                        $set: action.payload
                    }
                }
            } as any),
        // [EthereumActionType.TX_RECEIPT]: (
        //     state,
        //     action: ReceiveTxReceiptAction
        // ) => {
        //     return update(state, {
        //         transactions: {
        //             [action.payload.transactionHash]: {
        //                 receipt: {$set: action.payload},
        //                 status: {$set: TransactionStatus.RECEIPT}
        //             }
        //         }
        //     } as any);
        // },
        // [EthereumActionType.TX_CONFIRMATION]: (
        //     state,
        //     action: ReceiveTxConfirmationAction
        // ) => {
        //     return update(state, {
        //         transactions: {
        //             [action.payload.receipt.transactionHash]: {
        //                 $merge: action.payload
        //             }
        //         }
        //     } as any);
        // }
    },
    defaultState
);
