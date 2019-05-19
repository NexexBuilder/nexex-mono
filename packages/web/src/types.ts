import {Dex, DexConfig} from '@nexex/api';
import {OrderbookWsClient} from '@nexex/orderbook-client';
import {ERC20Token, OrderbookOrder} from '@nexex/types';
import BigNumber from 'bignumber.js';
import {TransactionStatus} from './constants';
import {Amount} from './utils/Amount';

export interface SiteConfig {
    dexConfig: DexConfig;
    takerFeeRate: string;
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
    | EthUnWrapTx;

export interface EthTransaction<T extends EthTransactionExtra> {
    txHash: string;
    status: TransactionStatus;
    type: string;
    userAddr: string;
    timestamp: Date;
    // receipt?: TransactionReceipt;
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

export type EpicDependencies = {
    dexPromise: Promise<Dex>;
    obClient: OrderbookWsClient;
};
