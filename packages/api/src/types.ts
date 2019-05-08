import {Provider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';

export type DexConfig = {
    network: 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan';
    provider?: Provider | string;
    portalAddr?: string;
};

export type AnyNumber = BigNumber | number | string;
