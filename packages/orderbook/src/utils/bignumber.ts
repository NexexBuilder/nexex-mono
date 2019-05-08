import BigNumberJs from 'bignumber.js';
import {BigNumber} from 'ethers/utils/bignumber';

export function bignumberToBignumber(bignumber: BigNumber): BigNumberJs {
    return new BigNumberJs(bignumber.toHexString());
}
