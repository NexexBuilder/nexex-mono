import ethUtil from 'ethereumjs-util';
import {ethers, Wallet} from 'ethers';
import 'reflect-metadata';
import {PortalEntry} from '../../src/constants';
import {Portal} from '../../src/contracts/Portal';

const TEST_ACCOUNT = {
    addr: '0x2E6b089dA137f83030229ce1E2D715969E0B36F8',
    pk: '0xf3ef78cff99391d22fc4d49cd728d83b43a7abc3d2f147887a5f1a2a1b1ac47d'
};

const TKN1 = {
    addr: '0xe420a7669007e1af47053eac33f9ff5797597051',
    decimals: 0,
    symbol: 'TNK1',
    name: 'TKN1 Test Token'
};

describe('portal contract', () => {
    let signer;
    let contract: Portal;
    beforeAll(() => {
        const provider = ethers.getDefaultProvider('kovan');
        signer = new Wallet(TEST_ACCOUNT.pk, provider);
        contract = new Portal(provider,'kovan', '0x2c1a328ee62842c034eb05d354219210c21b7c04');
    });

    it('query owner', async () => {
        const owner = await contract.owner();
        expect(owner).toEqual(TEST_ACCOUNT.addr);
    });

    it('query entry', async () => {
        const exchangeAddr = await contract.portalEntries(PortalEntry.TokenRegistry);
        expect(exchangeAddr).toBeDefined();
    });

    it('set entry', async () => {
        const entryIdx = 10;
        const tx = await contract.setEntry(signer, entryIdx, TKN1.addr);
        await tx.wait();
        const entry = await contract.portalEntries(entryIdx);
        expect(entry).toEqual(ethUtil.toChecksumAddress(TKN1.addr));
    });
});
