import {ECSignature} from '@nexex/types';
import * as _ from 'lodash';
import {signatureUtils} from './signatureUtils';

const HEX_REGEX = /^0x[0-9A-F]*$/i;

// async function isSenderAddressAvailable(eth: Eth, senderAddress: string): Promise<boolean> {
//     const addresses = await getAvailableAddresses(eth);
//     const normalizedAddress = senderAddress.toLowerCase();
//
//     return _.includes(addresses, normalizedAddress);
// }

// async function getAvailableAddresses(eth: Eth): Promise<string[]> {
//     const addresses = await eth.getAccounts();
//
//     return _.map(addresses, address => address.toLowerCase());
// }

export const assert = {
    isString(variableName: string, value: string): void {
        this.assert(_.isString(value), this.typeAssertionMessage(variableName, 'string', value));
    },
    isFunction(variableName: string, value: any): void {
        this.assert(_.isFunction(value), this.typeAssertionMessage(variableName, 'function', value));
    },
    isHexString(variableName: string, value: string): void {
        this.assert(
            _.isString(value) && HEX_REGEX.test(value),
            this.typeAssertionMessage(variableName, 'HexString', value)
        );
    },
    // isETHAddressHex(variableName: string, value: string): void {
    //     this.assert(_.isString(value), this.typeAssertionMessage(variableName, 'string', value));
    //     this.assert(ethUtil.isValidAddress(value), this.typeAssertionMessage(variableName, 'ETHAddressHex', value));
    // },
    doesBelongToStringEnum(
        variableName: string,
        value: string,
        stringEnum: any /* There is no base type for every string enum */
    ): void {
        const doesBelongToStringEnum = !_.isUndefined(stringEnum[value]);
        const enumValues = _.keys(stringEnum);
        const enumValuesAsStrings = _.map(enumValues, enumValue => `'${enumValue}'`);
        const enumValuesAsString = enumValuesAsStrings.join(', ');
        assert.assert(
            doesBelongToStringEnum,
            `Expected ${variableName} to be one of: ${enumValuesAsString}, encountered: ${value}`
        );
    },
    hasAtMostOneUniqueValue(value: any[], errMsg: string): void {
        this.assert(_.uniq(value).length <= 1, errMsg);
    },
    isNumber(variableName: string, value: number): void {
        this.assert(_.isFinite(value), this.typeAssertionMessage(variableName, 'number', value));
    },
    isBoolean(variableName: string, value: boolean): void {
        this.assert(_.isBoolean(value), this.typeAssertionMessage(variableName, 'boolean', value));
    },
    assert(condition: boolean, message: string): void {
        if (!condition) {
            throw new Error(message);
        }
    },
    typeAssertionMessage(variableName: string, type: string, value: any): string {
        return `Expected ${variableName} to be of type ${type}, encountered: ${value}`;
    },
    isValidSignature(orderHash: string, ecSignature: ECSignature, signerAddress: string): void {
        const isValidSignature = signatureUtils.isValidSignature(orderHash, ecSignature, signerAddress);
        this.assert(isValidSignature, `Expected order with hash '${orderHash}' to have a valid signature`);
    },
    // async isSenderAddressAsync(variableName: string, senderAddressHex: string, eth: Eth): Promise<void> {
    //     this.isETHAddressHex(variableName, senderAddressHex);
    //     const isAvailable = await isSenderAddressAvailable(eth, senderAddressHex);
    //     this.assert(
    //         isAvailable,
    //         `Specified ${variableName} ${senderAddressHex} isn't available through the supplied web3 provider`
    //     );
    // },
    // async isUserAddressAvailableAsync(eth: Eth): Promise<void> {
    //     const availableAddresses = await getAvailableAddresses(eth);
    //     this.assert(!_.isEmpty(availableAddresses), 'No addresses were available on the provided web3 provider');
    // },
    exists(value: any): void {
        this.assert(value !== undefined && value !== null, `${value} does not exist`);
    },
    notExists(value: any): void {
        this.assert(value === undefined || value === null, `${value} does exist`);
    }
};
