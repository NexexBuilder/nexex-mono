import {DexConfig} from '@nexex/api';
import {MarketConfig} from '@nexex/types/orderbook';
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
