import BigNumber from 'bignumber.js';
import {Dex, orderUtil} from '@nexex/api';
import {DexConfig, Order, PlainDexOrder} from '@nexex/types';
import Web3 from 'web3';
import config from '../../env_settings/config-test';

export async function generateRandomOrder(maker: string, dex: Dex): Promise<PlainDexOrder> {
    const order: Order = {
        maker,
        taker: '0x0000000000000000000000000000000000000000',
        makerFeeRecipient: '0x0000000000000000000000000000000000000000',
        makerTokenAddress: '0xcfed223fab2a41b5a5a5f9aaae2d1e882cb6fe2d',
        takerTokenAddress: '0x8273e4b8ed6c78e252a9fca5563adfcc75c91b2a',
        exchangeContractAddress: '0x8273e4b8ed6c78e252a9fca5563adfcc75c91b2a',
        salt: Dex.generatePseudoRandomSalt(),
        makerFeeRate: new BigNumber('0'),
        takerFeeRate: new BigNumber('0'),
        makerTokenAmount: new BigNumber('200000000000000000'),
        takerTokenAmount: new BigNumber('30'),
        expirationUnixTimestampSec: new BigNumber(new Date().getTime() / 1000).plus(60 * 60 * 24 * 365).decimalPlaces(0)
    };
    const orderHash = orderUtil.getOrderHashHex(order);
    const signature = await dex.signOrderHashAsync(orderHash, maker, false);
    return orderUtil.toPlainOrder({...order, ecSignature: signature});
}

export function initDex(accounts: {addr: string; pk: string}[]) {
    const dexConfig = config.dex as DexConfig;

    const provider = new Web3.providers.HttpProvider(config.provider);
    const dex = new Dex(provider, dexConfig);
    accounts.forEach(account => {
        dex.eth.accounts.wallet.add(account.pk);
    });
    dex.eth.getAccounts = () => Promise.resolve(accounts.map(account => account.addr));
    return dex;
}
