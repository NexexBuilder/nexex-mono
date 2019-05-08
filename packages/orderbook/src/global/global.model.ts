import {DexConfig} from '@nexex/api';
import {assign} from 'lodash';

export interface ZmqConfig {
    nodes: string[];
    port?: number;
    taskNode: string;
}

export interface IpfsConfig {
    prefix: string;
    repo: string;
    enabled: boolean;
}

export interface MarketConfig {
    minOrderBaseVolumn: string;
    minOrderQuoteVolumn: string;
    makerRecipient: string;
    minMakerFeeRate: string;
}

const DEFAULT_ZMQ_CONFIG = {
    nodes: [],
    taskNode: ''
};

export class ObConfig {
    dexConfig: DexConfig;
    markets: string[];
    marketDefault: MarketConfig;
    isTaskNode: boolean;
    isAllInOneNode: boolean = false;
    zmq: ZmqConfig = DEFAULT_ZMQ_CONFIG;
    ipfs: IpfsConfig;

    constructor(config: Partial<ObConfig>) {
        assign(this, config);
    }
}
