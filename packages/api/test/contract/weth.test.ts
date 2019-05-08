import {ethers, Wallet} from 'ethers';
import 'reflect-metadata';
import {Provider} from 'ethers/providers';
import {ERC20Contract} from '../../src/contracts/ERC20Contract';
import {WrappedETH} from '../../src/contracts/WrappedETH';

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

describe('weth contract', () => {
    let signer;
    let token: ERC20Contract;
    let contract: WrappedETH;
    let provider: Provider;
    beforeAll(() => {
        provider = ethers.getDefaultProvider('kovan');
        signer = new Wallet(TEST_ACCOUNT.pk, provider);
        contract = new WrappedETH(provider);
        contract.setContractAddr('0x94f750fc94292eaae0704a16935733f8eea2ae98');
        token = new ERC20Contract({addr: '0x94f750fc94292eaae0704a16935733f8eea2ae98'}, provider);
    });

    it('deposit', async () => {
        const depositAmount = 1000;
        const ethBefore = await provider.getBalance(TEST_ACCOUNT.addr);
        const wethBefore = await token.balanceOf(TEST_ACCOUNT.addr);
        const tx = await contract.deposit(signer, depositAmount);
        await tx.wait();
        const ethAfter = await provider.getBalance(TEST_ACCOUNT.addr);
        const wethAfter = await token.balanceOf(TEST_ACCOUNT.addr);
        expect(wethAfter.sub(wethBefore).toNumber()).toEqual(depositAmount);
        expect(ethBefore.sub(ethAfter).toNumber()).toBeGreaterThan(depositAmount);
    });

    it('withdraw', async () => {
        const withdrawAmount = 1000;
        const ethBefore = await provider.getBalance(TEST_ACCOUNT.addr);
        const wethBefore = await token.balanceOf(TEST_ACCOUNT.addr);
        const tx = await contract.withdraw(signer, withdrawAmount);
        await tx.wait();
        const ethAfter = await provider.getBalance(TEST_ACCOUNT.addr);
        const wethAfter = await token.balanceOf(TEST_ACCOUNT.addr);
        expect(wethBefore.sub(wethAfter).toNumber()).toEqual(withdrawAmount);
        expect(ethAfter.sub(ethBefore).toNumber()).toBeLessThan(withdrawAmount);
    });
});
