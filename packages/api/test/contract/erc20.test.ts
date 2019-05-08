import {ethers, Wallet} from 'ethers';
import 'reflect-metadata';
import {ERC20Contract} from '../../src/contracts/ERC20Contract';

const TEST_ACCOUNT = {
    addr: '0x2E6b089dA137f83030229ce1E2D715969E0B36F8',
    pk: '0xf3ef78cff99391d22fc4d49cd728d83b43a7abc3d2f147887a5f1a2a1b1ac47d'
};

const TEST_ACCOUNT2 = {
    addr: '0x2C035B186c3367A8C874AEfbBAd17cf5d4342aD4',
    pk: '0xc7d8c7c911906d800f683dc6d502c5e43789001a47bd95510a7ef3764285bbcf'
};

const TKN1 = {
    addr: '0xe420a7669007e1af47053eac33f9ff5797597051',
    decimals: 0,
    symbol: 'TNK1',
    name: 'TKN1 Test Token'
};

const TKN2 = {
    addr: '0x356d019013bb79ce7e303a90a5be91173d80b7b5',
    decimals: 18,
    symbol: 'TNK2',
    name: 'TKN2 Test Token'
};

describe('erc20 contract', () => {
    let signerForT1;
    let signerForT2;
    let contract: ERC20Contract;
    beforeAll(() => {
        const provider = ethers.getDefaultProvider('kovan');
        signerForT1 = new Wallet(TEST_ACCOUNT.pk, provider);
        signerForT2 = new Wallet(TEST_ACCOUNT2.pk, provider);
        contract = new ERC20Contract(TKN1, provider);
    });

    it('query balance', async () => {
        const balance = await contract.balanceOf(TEST_ACCOUNT.addr);
        expect(balance).toBeDefined();
    });

    it('approve/allowance', async () => {
        const allowance = '123456789012345678';
        const approveTx = await contract.approve(signerForT1, TEST_ACCOUNT2.addr, allowance);
        await approveTx.wait();
        expect((await contract.allowance(TEST_ACCOUNT.addr, TEST_ACCOUNT2.addr)).toString()).toEqual(allowance);
    });

    it('transfer', async () => {
        const transferAmount = 12345;
        const balanceBefore = await contract.balanceOf(TEST_ACCOUNT2.addr);
        const tx = await contract.transfer(signerForT1, TEST_ACCOUNT2.addr, transferAmount);
        await tx.wait();
        const balanceAfter = await contract.balanceOf(TEST_ACCOUNT2.addr);
        expect(balanceAfter.sub(balanceBefore).toNumber()).toEqual(transferAmount);
    });

    it('transferFrom', async () => {
        const transferAmount = 12345;
        const balanceBefore = await contract.balanceOf(TEST_ACCOUNT2.addr);
        const allowance = await contract.allowance(TEST_ACCOUNT.addr, TEST_ACCOUNT2.addr);
        if (allowance.lt(transferAmount)) {
            const approveTx = await contract.approve(signerForT1, TEST_ACCOUNT2.addr, transferAmount);
            await approveTx.wait();
        }
        const tx = await contract.transferFrom(signerForT2, TEST_ACCOUNT.addr, TEST_ACCOUNT2.addr, transferAmount);
        await tx.wait();
        const balanceAfter = await contract.balanceOf(TEST_ACCOUNT2.addr);
        expect(balanceAfter.sub(balanceBefore).toNumber()).toEqual(transferAmount);
    });
});
