import {createAction} from 'redux-actions';
import {PLUGIN_ACCESS, TransactionStatus} from '../../constants';
import {EthTransaction, EthTransactionExtra} from '../../types';
import {TransactionReceipt} from 'ethers/providers';

export enum EthereumActionType {
    BLOCKNUMBER_UPDATE = 'ethereum/BLOCKNUMBER_UPDATE',
    PLUGIN_ACCESS_UPDATE = 'ethereum/PLUGIN_ACCESS_UPDATE',
    INJECTED_PROVIDER_ENABLED_UPDATE = 'ethereum/INJECTED_PROVIDER_ENABLED_UPDATE',
    NETWORK_DETECTED = 'ethereum/NETWORK_DETECTED',
    TX_TXHASH = 'ethereum/TX_TXHASH',
    TX_RECEIPT = 'ethereum/TX_RECEIPT',
    TX_CONFIRMATION = 'ethereum/TX_CONFIRMATION',
    TX_ERROR = 'ethereum/TX_ERROR',
}

export const updateBlockNumber = createAction(EthereumActionType.BLOCKNUMBER_UPDATE,
    (blocknumber: number) => blocknumber);
export type UpdateBlockNumberAction = ReturnType<typeof updateBlockNumber>;

export const updatePluginAccess = createAction(EthereumActionType.PLUGIN_ACCESS_UPDATE,
    (pluginAccess: PLUGIN_ACCESS) => pluginAccess);
export type UpdatePluginAccessAction = ReturnType<typeof updatePluginAccess>;

export const updateInjectedProviderEnabled = createAction(EthereumActionType.INJECTED_PROVIDER_ENABLED_UPDATE,
    (enabled: boolean) => enabled);
export type UpdateInjectedProviderEnabledAction = ReturnType<typeof updateInjectedProviderEnabled>;

export const detectNetwork = createAction(EthereumActionType.NETWORK_DETECTED,
    (pluginNetworkId: number, isWrongNetwork: boolean) => ({pluginNetworkId, isWrongNetwork}));
export type NetworkDetectAction = ReturnType<typeof detectNetwork>;

export const receiveTxHash = createAction(EthereumActionType.TX_TXHASH,
    (ethTx: EthTransaction<EthTransactionExtra>) => ethTx);
export type ReceiveTxHashAction = ReturnType<typeof receiveTxHash>;

export const receiveTxReceipt = createAction(EthereumActionType.TX_RECEIPT,
    (receipt: TransactionReceipt) => receipt);
export type ReceiveTxReceiptAction = ReturnType<typeof receiveTxReceipt>;

export const receiveTxConfirmation = createAction(EthereumActionType.TX_CONFIRMATION,
    (confirmationNumber: number, receipt: TransactionReceipt) => {
        if (confirmationNumber >= 12) {
            return {confirmationNumber, receipt, status: TransactionStatus.CONFIRMATION};
        } else {
            return {confirmationNumber, receipt};
        }
    });
export type ReceiveTxConfirmationAction = ReturnType<typeof receiveTxConfirmation>;

export const receiveTxError = createAction(EthereumActionType.TX_ERROR,
    (error: Error | undefined, receipt: TransactionReceipt | undefined) => ({error, receipt}));
