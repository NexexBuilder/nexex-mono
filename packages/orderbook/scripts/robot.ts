import Axio from 'axios';
import BigNumber from 'bignumber.js';
import Bluebird from 'bluebird';
import {Dex, orderUtil, constants, DexConfig} from '@nexex/api';
import {Order, OrderSide, PlainDexOrder} from '@nexex/types';
import {PlainUnsignedOrder} from '../../types/src';
import {Wallet} from 'ethers/wallet';
import {Signer} from 'ethers/ethers';

const config = {
    provider: 'https://kovan.infura.io/v3/3803e04900184c138c3aaa21e2689599',
    dex: {
        network: 'kovan',
        portalAddr: '0x2c1a328ee62842c034eb05d354219210c21b7c04'
    }
};

// const baseToken = '0x1dad4783cf3fe3085c1426157ab175a6119a04ba'; // MKR
const baseToken = '0x356d019013bb79ce7e303a90a5be91173d80b7b5'; // TNK2
const quoteToken = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'; // WETH
export async function generateRandomOrder(
    signer: Wallet,
    side: OrderSide,
    amount: BigNumber,
    price: BigNumber,
    dex: Dex
): Promise<PlainDexOrder> {
    let makerTokenAddress, takerTokenAddress, makerTokenAmount, takerTokenAmount;
    if (side === OrderSide.ASK) {
        makerTokenAddress = baseToken;
        takerTokenAddress = quoteToken;
        makerTokenAmount = amount;
        takerTokenAmount = makerTokenAmount.times(price).decimalPlaces(0);
    } else {
        takerTokenAddress = baseToken;
        makerTokenAddress = quoteToken;
        takerTokenAmount = amount;
        makerTokenAmount = takerTokenAmount.times(price).decimalPlaces(0);
    }
    const order: PlainUnsignedOrder = {
        maker: signer.address,
        taker: '0x0000000000000000000000000000000000000000',
        makerFeeRecipient: '0xDCb23BDacbB3360F16a91127391525EAf7711877',
        makerTokenAddress,
        takerTokenAddress,
        exchangeContractAddress: '0x972e49eca52ad7a92b4a268ccc9fd14b5fd17c27',
        salt: Dex.generatePseudoRandomSalt(),
        makerFeeRate: '0',
        takerFeeRate: '0',
        makerTokenAmount: makerTokenAmount.toString(),
        takerTokenAmount: takerTokenAmount.toString(),
        expirationUnixTimestampSec: new BigNumber(new Date().getTime() / 1000)
            .plus(60 * 60 * 24 * 365)
            .decimalPlaces(0)
            .toNumber()
    };

    return dex.signOrder(signer, order);
}

export async function initDex() {
    const dexConfig = config.dex as DexConfig;
    const dex = await Dex.create(dexConfig);
    return dex;
}

const TEST_ACCOUNT2 = {
    addr: '0x2C035B186c3367A8C874AEfbBAd17cf5d4342aD4',
    pk: '0xc7d8c7c911906d800f683dc6d502c5e43789001a47bd95510a7ef3764285bbcf'
};

const TEST_ACCOUNT = {
    addr: '0x2E6b089dA137f83030229ce1E2D715969E0B36F8',
    pk: '0xf3ef78cff99391d22fc4d49cd728d83b43a7abc3d2f147887a5f1a2a1b1ac47d'
};

async function main() {
    const dex = await initDex();
    while (true) {
        try {
            const side = Math.floor(Math.random() * 2) === 0 ? OrderSide.BID : OrderSide.ASK;
            const amount = BigNumber.random(18).times(10 ** 20);
            const priceOffset = side === OrderSide.ASK ? 0.5 : 0;
            const price = BigNumber.random(3)
                .times(0.3)
                .plus(priceOffset);
            const wallet = new Wallet(TEST_ACCOUNT.pk, dex.eth);
            const order = await generateRandomOrder(wallet, side, amount, price, dex);
            await Axio.post('http://localhost:3001/v1/order', order); // http://kovan.nexex.info/v1/order
            await Bluebird.delay(5000);
        } catch (e) {
            console.error(e);
            await Bluebird.delay(5000);
        }
    }
}

main();
