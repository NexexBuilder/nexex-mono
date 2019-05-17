import {ethers} from 'ethers';

export function initProvider() {
    return ethers.getDefaultProvider('kovan');
}
