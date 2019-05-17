import BigNumber from 'bignumber.js';
import {AmountUnit} from '../constants';

export class Amount {
    public unit: AmountUnit;
    public value: BigNumber;
    public decimals: number;

    constructor(value: BigNumber.Value, unit: AmountUnit, decimals: number) {
        this.unit = unit;
        this.value = new BigNumber(String(value));
        this.decimals = decimals;
        this.validate();
    }

    public toWei(): BigNumber {
        if (this.unit === AmountUnit.WEI) {
            return this.value;
        } else if (this.unit === AmountUnit.ETHER) {
            return this.value.times(Math.pow(10, this.decimals));
        }
    }

    public toEther(): BigNumber {
        if (this.unit === AmountUnit.ETHER) {
            return this.value;
        } else if (this.unit === AmountUnit.WEI) {
            return this.value.div(Math.pow(10, this.decimals));
        }
    }

    public times(number: BigNumber.Value, roundMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): Amount {
        let value;
        if (this.unit === AmountUnit.ETHER) {
            value = this.toWei();
        } else {
            value = this.value;
        }
        return new Amount(value.times(number).decimalPlaces(0, roundMode), AmountUnit.WEI, this.decimals);
    }

    public div(number: BigNumber.Value, roundMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): Amount {
        let value;
        if (this.unit === AmountUnit.ETHER) {
            value = this.toWei();
        } else {
            value = this.value;
        }
        return new Amount(this.value.div(number).decimalPlaces(0, roundMode), AmountUnit.WEI, this.decimals);
    }

    public toString(decimals: number = 3): string {
        return this.toEther().toFixed(decimals, BigNumber.ROUND_DOWN);
    }

    private validate(): void {
        if (!this.toWei().isInteger()) {
            throw new Error('not a integer number');
        }
    }
}
