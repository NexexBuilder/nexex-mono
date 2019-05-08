import {PlainDexOrder, PlainUnsignedOrder, SignedOrder, SolidityTypes} from '@nexex/types';
import {BigNumber, hexlify, solidityKeccak256} from 'ethers/utils';
import {signatureUtils} from './signatureUtils';

// export function fromPlainOrder(order: PlainDexOrder): SignedOrder {
//     return {
//         maker: order.maker,
//         taker: order.taker,
//         makerFeeRate: new BigNumber(order.makerFeeRate),
//         takerFeeRate: new BigNumber(order.takerFeeRate),
//         makerTokenAmount: new BigNumber(order.makerTokenAmount),
//         takerTokenAmount: new BigNumber(order.takerTokenAmount),
//         makerTokenAddress: order.makerTokenAddress,
//         takerTokenAddress: order.takerTokenAddress,
//         salt: new BigNumber(order.salt),
//         exchangeContractAddress: order.exchangeContractAddress,
//         makerFeeRecipient: order.makerFeeRecipient,
//         expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
//         ecSignature: order.ecSignature
//     };
// }

// export function toPlainOrder(order: SignedOrder): PlainDexOrder {
//     return {
//         maker: order.maker,
//         taker: order.taker,
//         makerFeeRate: order.makerFeeRate.toString(10),
//         takerFeeRate: order.takerFeeRate.toString(10),
//         makerTokenAmount: order.makerTokenAmount.toString(10),
//         takerTokenAmount: order.takerTokenAmount.toString(10),
//         makerTokenAddress: order.makerTokenAddress,
//         takerTokenAddress: order.takerTokenAddress,
//         salt: order.salt.toString(10),
//         exchangeContractAddress: order.exchangeContractAddress,
//         makerFeeRecipient: order.makerFeeRecipient,
//         expirationUnixTimestampSec: order.expirationUnixTimestampSec.toNumber(),
//         ecSignature: order.ecSignature
//     };
// }

export function getOrderHashHex(order: PlainDexOrder | PlainUnsignedOrder): string {
    const orderParts = [
        {value: order.exchangeContractAddress, type: SolidityTypes.Address},
        {value: order.maker, type: SolidityTypes.Address},
        {value: order.taker, type: SolidityTypes.Address},
        {value: order.makerTokenAddress, type: SolidityTypes.Address},
        {value: order.takerTokenAddress, type: SolidityTypes.Address},
        {value: order.makerFeeRecipient, type: SolidityTypes.Address},
        {
            value: new BigNumber(order.makerTokenAmount),
            type: SolidityTypes.Uint256
        },
        {
            value: new BigNumber(order.takerTokenAmount),
            type: SolidityTypes.Uint256
        },
        {
            value: new BigNumber(order.makerFeeRate),
            type: SolidityTypes.Uint256
        },
        {
            value: new BigNumber(order.takerFeeRate),
            type: SolidityTypes.Uint256
        },
        {
            value: new BigNumber(order.expirationUnixTimestampSec),
            type: SolidityTypes.Uint256
        },
        {value: new BigNumber(order.salt), type: SolidityTypes.Uint256}
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
