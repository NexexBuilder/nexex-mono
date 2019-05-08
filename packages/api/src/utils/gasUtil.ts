import {AnyNumber} from '../types';

export type GasOption = {
    gasPrice: AnyNumber;
    gasLimit: AnyNumber;
};
//31gwei
const GAS_PRICE = 31 * 10 ** 9;
export enum SCENES {
    TRANSFER = 'Transfer',
    TRADE = 'Trade'
}

const SCENE_GAS_LIMIT: {[scen: string]: number} = {
    Transfer: 250000,
    Trade: 500000
};

export function getGasOption(scene: SCENES, gasPrice: AnyNumber = GAS_PRICE): GasOption {
    return {
        gasLimit: SCENE_GAS_LIMIT[scene],
        gasPrice: gasPrice
    };
}
