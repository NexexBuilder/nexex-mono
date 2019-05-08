import BigNumber from 'bignumber.js';
import {PlainDexOrder} from '../index';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const lowerCaseSerializer = {
    Serialize(x: any): any {
        return String(x).toLowerCase();
    },
    Deserialize(x: any): any {
        return String(x).toLowerCase();
    }
};

export const bnSerializer = {
    Serialize(val: BigNumber): string {
        return val.toString(10);
    },
    Deserialize(val: string): BigNumber {
        return new BigNumber(val);
    }
};

export const bn2HexSerializer = {
    Serialize(val: BigNumber): string {
        return `0x${val.toString(16)}`;
    },
    Deserialize(val: string): BigNumber {
        return new BigNumber(val);
    }
};

export const bnSec2dateSerializer = {
    Serialize(val: BigNumber): any {
        return new Date(val.times(1000).toNumber());
    },
    Deserialize(date: number | Date): any {
        if (typeof date === 'number') {
            return new BigNumber(date);
        } else if (typeof date === 'string') {
            return new BigNumber(new Date(date).getTime()).div(1000).decimalPlaces(0);
        } else {
            return new BigNumber(date.getTime()).div(1000).decimalPlaces(0);
        }
    }
};

export const dateSerializer = {
    Serialize(date: any): any {
        return date;
    },
    Deserialize(date: any): any {
        return date;
    }
};

export const orderNormalizeSerializer = {
    Serialize(val: PlainDexOrder): PlainDexOrder {
        return {
            maker: val.maker.toLowerCase(),
            taker: val.taker ? val.taker.toLowerCase() : NULL_ADDRESS,
            makerFeeRate: val.makerFeeRate,
            takerFeeRate: val.takerFeeRate,
            makerTokenAmount: val.makerTokenAmount,
            takerTokenAmount: val.takerTokenAmount,
            makerTokenAddress: val.makerTokenAddress.toLowerCase(),
            takerTokenAddress: val.takerTokenAddress.toLowerCase(),
            salt: val.salt,
            exchangeContractAddress: val.exchangeContractAddress.toLowerCase(),
            makerFeeRecipient: val.makerFeeRecipient.toLowerCase(),
            expirationUnixTimestampSec: val.expirationUnixTimestampSec,
            ecSignature: val.ecSignature
        };
    }
};
