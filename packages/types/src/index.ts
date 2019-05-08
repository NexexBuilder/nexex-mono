import BigNumber from 'bignumber.js';

import * as ErrorsDefs from './errors';

export const Errors = ErrorsDefs;

export {
    ObEventTypes,
    NewOrderOnboardEvent,
    OrderbookEvent,
    DownstreamEvent,
    NewOrderAcceptedEvent,
    NewOrderAcceptedPayload,
    OrderbookOrder,
    UpdateOrderTask
} from './orderbook';

export type ArtifactContractName = 'TokenTransferProxy' | 'TokenRegistry' | 'Token' | 'Exchange' | 'EtherToken';

export interface Artifact {
    contract_name: ArtifactContractName;
    abi: any[];
    networks: {
        [networkId: string]: {
            address: string;
        };
    };
}

export enum SolidityTypes {
    Address = 'address',
    Uint256 = 'uint256',
    Uint8 = 'uint8',
    Uint = 'uint'
}

/**
 * Elliptic Curve signature
 */
export interface ECSignature {
    v: number;
    r: string;
    s: string;
}

export type ERC20Token = {
    addr: string;
    decimals?: number;
    name?: string;
    symbol?: string;
};

export interface Order {
    maker: string;
    taker: string | undefined;
    makerFeeRate: BigNumber;
    takerFeeRate: BigNumber;
    makerTokenAmount: BigNumber;
    takerTokenAmount: BigNumber;
    makerTokenAddress: string;
    takerTokenAddress: string;
    salt: BigNumber;
    exchangeContractAddress: string;
    makerFeeRecipient: string;
    expirationUnixTimestampSec: BigNumber;
}

export interface SignedOrder extends Order {
    ecSignature: ECSignature;
}

export interface PlainUnsignedOrder {
    maker: string;
    taker?: string;
    makerFeeRate: string;
    takerFeeRate: string;
    makerTokenAmount: string;
    takerTokenAmount: string;
    makerTokenAddress: string;
    takerTokenAddress: string;
    salt: string;
    exchangeContractAddress: string;
    makerFeeRecipient: string;
    expirationUnixTimestampSec: number;
}

export interface PlainDexOrder extends PlainUnsignedOrder {
    ecSignature: ECSignature;
}

export interface InstrumentConfig {
    hybridOrderbook: boolean;
}

export interface Instrument {
    base: ERC20Token;
    quote: ERC20Token;
    config: InstrumentConfig;
}

export interface TokenMetaData {
    addr: string;
    name: string;
    symbol: string;
    decimals: number;
    ipfsHash: string;
    swarmHash: string;
}

export enum OrderSide {
    /** buy **/
    BID = 'BID',
    /** sell **/
    ASK = 'ASK'
}

export enum OrderState {
    OPEN = 'OPEN',
    FILLED = 'FILLED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    UNFUNDED = 'UNFUNDED'
}
