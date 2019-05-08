import {ethers, Wallet} from 'ethers';
import 'reflect-metadata';
import {constants, PortalEntry} from '../src/constants';
import {Exchange} from '../src/contracts/Exchange';
import {Portal} from '../src/contracts/Portal';
import {TokenTransferProxy} from '../src/contracts/TokenTransferProxy';
import {isAddrEq} from '../src/utils/address';

const TEST_ACCOUNT = {
    addr: '0x2E6b089dA137f83030229ce1E2D715969E0B36F8',
    pk: '0xf3ef78cff99391d22fc4d49cd728d83b43a7abc3d2f147887a5f1a2a1b1ac47d'
};

const exchangeAddr = '0x972e49eca52ad7a92b4a268ccc9fd14b5fd17c27';
const newMaxTakerFeeRate = 3 * 10 ** 15;
const newMaxMakerFeeRate = 3 * 10 ** 15;

describe('setup contract', () => {
    let signer;
    let contract: Portal;
    beforeAll(() => {
        const provider = ethers.getDefaultProvider('kovan');
        signer = new Wallet(TEST_ACCOUNT.pk, provider);
        contract = new Portal(provider, 'kovan', '0x2c1a328ee62842c034eb05d354219210c21b7c04');
    });

    it('setup exchange entry', async () => {
        const portalExchangeAddr = await contract.portalEntries(PortalEntry.Exchange);
        if (!isAddrEq(portalExchangeAddr, exchangeAddr)) {
            console.log('updating exchange address in Portal');
            const tx = await contract.setEntry(signer, PortalEntry.Exchange, exchangeAddr);
            await tx.wait();
        }
    });

    it.only('setup token transfer proxy entry', async () => {
        // await contract.setEntry(signer, PortalEntry.TransferGateway, '0x5Af5874c33EaB74DE715BcCe25c6825a7cD613f2');
        const [portalGatewayProxy, exchangeAddr] = [
            await contract.portalEntries(PortalEntry.TransferGateway),
            await contract.portalEntries(PortalEntry.Exchange)
        ];
        const exchange = new Exchange(signer, 'kovan', exchangeAddr);
        const exchangeGateway = await exchange.tokenTransferProxy();
        if (isAddrEq(exchangeGateway, constants.NULL_ADDRESS)) {
            console.log('updating transfer proxy in Exchange', portalGatewayProxy);
            const tx = await exchange.changeTokenTransferProxy(signer, portalGatewayProxy);
            await tx.wait();
        } else if (!isAddrEq(exchangeGateway, portalGatewayProxy)) {
            console.error('gateway already be set and is not the same as Portal', exchangeGateway);
        } else {
            console.log('gateway already be set', exchangeGateway);
        }
    });

    it('setup gateway whitelist', async () => {
        const exchangeAddr = await contract.portalEntries(PortalEntry.Exchange);
        const exchange = new Exchange(signer, 'kovan', exchangeAddr);
        const exchangeGateway = await exchange.tokenTransferProxy();
        const transferProxy = new TokenTransferProxy(signer, 'kovan', exchangeGateway);

        if (await transferProxy.isAuthorized(exchangeAddr)) {
            console.log('already authorized, skip');
        } else {
            console.log('authorize now,', exchangeAddr);
            const tx = await transferProxy.addAuthorizedAddress(signer, exchangeAddr);
            await tx.wait();
        }
    });

    it('setup max fee rules', async () => {
        const exchangeAddr = await contract.portalEntries(PortalEntry.Exchange);
        const exchange = new Exchange(signer, 'kovan', exchangeAddr);
        const [maxMakerFeeRate, maxTakerFeeRate] = [await exchange.maxMakerFeeRate(), await exchange.maxTakerFeeRate()];
        if (maxMakerFeeRate.eq(0) && newMaxMakerFeeRate) {
            console.log('maxMakerFeeRate is 0, updating to', newMaxMakerFeeRate);
            const tx = await exchange.changeMaxMakerFeeRate(signer, newMaxMakerFeeRate);
            await tx.wait();
        }
        if (maxTakerFeeRate.eq(0) && newMaxTakerFeeRate) {
            console.log('maxTakerFeeRate is 0, updating to', newMaxTakerFeeRate);
            const tx = await exchange.changeMaxTakerFeeRate(signer, newMaxTakerFeeRate);
            await tx.wait();
        }
    });

    it.skip('query', async () => {
        const exchangeAddr = '0x6A7BaC0076e10C4326d485C4cA64Eba1567FA63c';
        const exchange = new Exchange(signer, 'kovan', exchangeAddr);
        const exchangeGateway = await exchange.tokenTransferProxy();
        console.log('gateway', exchangeGateway);
    });
});
