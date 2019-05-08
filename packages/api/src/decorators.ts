import {getAddress} from 'ethers/utils';
import {isValidOrder} from './utils/orderUtil';

const ethAddressHexMetadataKey = Symbol('ethAddressHexMetadataKey');
const exchangeOrderMetadataKey = Symbol('exchangeOrderMetadataKey');

function isTypePromise(Type: any): boolean {
    try {
        const test = new Type(() => ({}));
        return test.then && typeof test.then === 'function';
    } catch (e) {
        return false;
    }
}

export function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void {
    const method = descriptor.value;
    const ethHexAddrParameters: number[] = Reflect.getOwnMetadata(ethAddressHexMetadataKey, target, propertyName);
    const orderParameters: number[] = Reflect.getOwnMetadata(exchangeOrderMetadataKey, target, propertyName);
    const retType = Reflect.getMetadata('design:returntype', target, propertyName);
    const isReturnPromise = isTypePromise(retType);
    descriptor.value = function() {
        let isError: Error | undefined;
        const newArgs = arguments;
        /* ethHexAddr */
        if (ethHexAddrParameters) {
            for (let i = 0; i < newArgs.length; i++) {
                const arg = newArgs[i];
                if (ethHexAddrParameters.includes(i)) {
                    try {
                        newArgs[i] = getAddress(arg);
                    } catch (e) {
                        newArgs[i] = arg;
                        isError = e;
                    }
                } else {
                    newArgs[i] = arg;
                }
            }
        }
        /* exchange order */
        if (orderParameters) {
            for (let i = 0; i < newArgs.length; i++) {
                const arg = newArgs[i];
                if (orderParameters.includes(i)) {
                    try {
                        if (getAddress(arg.exchangeContractAddress) !== getAddress(this.getContractAddress())) {
                            isError = new Error('exchange address in order not match');
                        }
                    } catch (e) {
                        isError = e;
                    }
                    if (!isValidOrder(arg)) {
                        isError = new Error('order signature not valid');
                    }
                }
            }
        }

        if (isError) {
            if (isReturnPromise) {
                return Promise.reject(isError);
            } else {
                throw isError;
            }
        } else {
            return method.apply(this, newArgs);
        }
    };
}

function ethAddressHex(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
    const existingEthAddrHexParameters: number[] =
        Reflect.getOwnMetadata(ethAddressHexMetadataKey, target, propertyKey) || [];
    existingEthAddrHexParameters.push(parameterIndex);
    Reflect.defineMetadata(ethAddressHexMetadataKey, existingEthAddrHexParameters, target, propertyKey);
}

function exchangeOrder(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
    const existingParameters: number[] = Reflect.getOwnMetadata(exchangeOrderMetadataKey, target, propertyKey) || [];
    existingParameters.push(parameterIndex);
    Reflect.defineMetadata(exchangeOrderMetadataKey, existingParameters, target, propertyKey);
}

export const validators = {
    ethAddressHex,
    exchangeOrder
};
