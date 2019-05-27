import {Dex, DexConfig} from '@nexex/api';
import {AnyNumber} from '@nexex/api/types';
import {OrderbookWsClient} from '@nexex/orderbook-client';
import {ERC20Token, OrderbookOrder, PlainDexOrder} from '@nexex/types';
import {TransactionReceipt} from 'ethers/providers';
import {TransactionStatus} from './constants';
import {Amount} from './utils/Amount';

export interface SiteConfig {
    dexConfig: DexConfig;
    takerFeeRate: string;
    takerFeeRecipient: string;
    orderExpiration: number;
    dexOrderbook: {
        url: string;
    };
}

declare global {
    interface Window {
        config: SiteConfig;
        web3?: any;
        ethereum?: any;
        devToolsExtension?: any;
    }
}

export interface FtOrder extends Pick<OrderbookOrder, Exclude<keyof OrderbookOrder,
    'remainingBaseTokenAmount' | 'remainingQuoteTokenAmount' | 'baseTokenAddress' | 'quoteTokenAddress'>> {
    remainingBaseTokenAmount: Amount;
    remainingQuoteTokenAmount: Amount;
    baseToken: ERC20Token;
    quoteToken: ERC20Token;
}

export type EthTransactionExtra =
    | TokenApproveTX
    | TokenRevokeApprovalTX
    | EthWrapTx
    | EthUnWrapTx
    | EthOrderFillTx
    | EthOrderCancelTx
;

export interface EthTransaction<T extends EthTransactionExtra> {
    txHash: string;
    status: TransactionStatus;
    type: string;
    userAddr: string;
    timestamp: Date;
    receipt?: TransactionReceipt;
    confirmation?: number;
    extra?: T;
}

export interface TokenApproveTX {
    token: ERC20Token;
}

export interface TokenRevokeApprovalTX {
    token: ERC20Token;
}

export interface EthWrapTx {
    amount: Amount;
}

export interface EthUnWrapTx {
    amount: Amount;
}

export interface EthOrderFillTx {
    takerAmount: AnyNumber;
    order: PlainDexOrder;
}

export interface EthOrderCancelTx {
    order: PlainDexOrder;
}

export type EpicDependencies = {
    dexPromise: Promise<Dex>;
    obClient: OrderbookWsClient;
};
