import {utils} from 'ethers';

const {parseEther} = utils;

export class FeeRate extends utils.BigNumber {
    static from(feeRate: string) {
        const parsed = parseEther(feeRate);
        if (parsed.gt(parseEther('1'))) {
            throw new Error('not a valid fee rate');
        }
        return parsed;
    }

    private constructor(value) {
        super(value);
    }
}
