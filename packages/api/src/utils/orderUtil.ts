import {PlainDexOrder, PlainUnsignedOrder, SolidityTypes} from '@nexex/types';
import {utils} from 'ethers';
import {signatureUtils} from './signatureUtils';

const {bigNumberify, hexlify, solidityKeccak256} = utils;

export function getOrderHashHex(order: PlainDexOrder | PlainUnsignedOrder): string {
    const orderParts = [
        {value: order.exchangeContractAddress, type: SolidityTypes.Address},
        {value: order.maker, type: SolidityTypes.Address},
        {value: order.taker, type: SolidityTypes.Address},
        {value: order.makerTokenAddress, type: SolidityTypes.Address},
        {value: order.takerTokenAddress, type: SolidityTypes.Address},
        {value: order.makerFeeRecipient, type: SolidityTypes.Address},
        {
            value: new utils.BigNumber(order.makerTokenAmount),
            type: SolidityTypes.Uint256
        },
        {
            value: bigNumberify(order.takerTokenAmount),
            type: SolidityTypes.Uint256
        },
        {
            value: bigNumberify(order.makerFeeRate),
            type: SolidityTypes.Uint256
        },
        {
            value: bigNumberify(order.takerFeeRate),
            type: SolidityTypes.Uint256
        },
        {
            value: bigNumberify(order.expirationUnixTimestampSec),
            type: SolidityTypes.Uint256
        },
        {value: bigNumberify(order.salt), type: SolidityTypes.Uint256}
    ];
    const types = orderParts.map(o => o.type);
    const values = orderParts.map(o => o.value);
    const hashBuff = solidityKeccak256(types, values);

    return hexlify(hashBuff);
}

export function isValidOrder(order: PlainDexOrder): boolean {
    const hash = getOrderHashHex(order);

    return signatureUtils.isValidSignature(hash, order.ecSignature, order.maker);
}
