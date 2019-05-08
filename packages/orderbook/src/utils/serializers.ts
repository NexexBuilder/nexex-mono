import BigNumber from 'bignumber.js';

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
