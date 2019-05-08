import {ECSignature} from '@nexex/types';
import {arrayify, getAddress, joinSignature, recoverAddress, verifyMessage} from 'ethers/utils';

export const signatureUtils = {
    isValidSignature(data: string, ecSignature: ECSignature, signerAddress: string): boolean {
        try {
            const retrievedAddress = verifyMessage(arrayify(data), ecSignature);

            return retrievedAddress === getAddress(signerAddress);
        } catch (err) {
            return false;
        }
    }
    // parseSignatureHexAsVRS(signatureHex: string): ECSignature {
    //     const signatureBuffer = arrayify(signatureHex);
    //     let v = signatureBuffer[0];
    //     if (v < 27) {
    //         v += 27;
    //     }
    //     const r = signatureBuffer.slice(1, 33);
    //     const s = signatureBuffer.slice(33, 65);
    //
    //     return {
    //         v,
    //         r: hexlify(r),
    //         s: hexlify(s)
    //     };
    // },
    // parseSignatureHexAsRSV(signatureHex: string): ECSignature {
    //     const {v, r, s} = ethUtil.fromRpcSig(signatureHex);
    //
    //     return {
    //         v,
    //         r: ethUtil.bufferToHex(r),
    //         s: ethUtil.bufferToHex(s)
    //     };
    // }
};
