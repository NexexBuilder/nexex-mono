import {ECSignature} from '@nexex/types';
import {utils} from 'ethers';

const {arrayify, getAddress, verifyMessage} = utils;

export const signatureUtils = {
    isValidSignature(data: string, ecSignature: ECSignature, signerAddress: string): boolean {
        try {
            const retrievedAddress = verifyMessage(arrayify(data), ecSignature);

            return retrievedAddress === getAddress(signerAddress);
        } catch (err) {
            return false;
        }
    }
};
