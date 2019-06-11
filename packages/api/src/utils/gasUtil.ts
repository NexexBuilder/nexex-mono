import {AnyNumber} from '../types';

export type GasOption = {
    gasPrice: AnyNumber;
    gasLimit: AnyNumber;
};

export enum SCENES {
    TRANSFER = 'Transfer',
    TRADE = 'Trade'
}

const MAX_GAS_LIMIT = 8000000;

const SCENE_GAS_LIMIT: {[scen: string]: number} = {
    Transfer: 200000,
    Trade: 300000
};

export function getGasLimit(scene: SCENES, times: number = 1) {
    return Math.min(SCENE_GAS_LIMIT[scene] * times, MAX_GAS_LIMIT);
}

export function getGasOption(scene: SCENES, gasPrice?: AnyNumber): GasOption {
    return {
        gasLimit: getGasLimit(scene),
        gasPrice: gasPrice
    };
}
