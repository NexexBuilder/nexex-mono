import {ethers} from 'ethers';

export function getMetamaskSigner() {
    return getMetamaskProvider().getSigner();
}

export function getMetamaskProvider() {
    return new ethers.providers.Web3Provider(window.web3.currentProvider);
}
