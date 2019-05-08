import {expect} from 'chai';
import {PlainUnsignedOrder} from '@nexex/types';
import 'reflect-metadata';
import {Wallet} from 'ethers';
import {constants} from '../src/constants';
import {ERC20Contract} from '../src/contracts/ERC20Contract';
import {TokenTransferProxy} from '../src/contracts/TokenTransferProxy';
import {Dex} from '../src/dex';
import {orderUtil} from '../src/utils';
import {getGasOption, SCENES} from '../src/utils/gasUtil';
import {DexConfig} from '../src/types';
import {getOrderHashHex} from '../src/utils/orderUtil';
import {ensureBalance, ensureGatewayAllowance, queryBalance} from './utils/testHelper';

const TEST_ACCOUNT = {
    addr: '0x2E6b089dA137f83030229ce1E2D715969E0B36F8',
    pk: '0xf3ef78cff99391d22fc4d49cd728d83b43a7abc3d2f147887a5f1a2a1b1ac47d'
};
const TEST_ACCOUNT2 = {
    addr: '0x2C035B186c3367A8C874AEfbBAd17cf5d4342aD4',
    pk: '0xc7d8c7c911906d800f683dc6d502c5e43789001a47bd95510a7ef3764285bbcf'
};
const TEST_ACCOUNT3 = {
    addr: '0xDCb23BDacbB3360F16a91127391525EAf7711877',
    pk: '0xca9cec731c61365756ecf70125eba99f495484a2d8ba24f71561dd78d4e24bfd'
};
const TEST_ACCOUNT4 = {
    addr: '0x0E888E0b5B0F19400538338bCAc0AE0fBEF17c03',
    pk: '0x16b4cde5d6836d883bff57f89d08a376eb9761e48251e5337ff222ff1578f35e'
};
const TEST_ACCOUNT5 = {
    addr: '0x13431C8980e67722bBd0db77d0582Be3b381efC6',
    pk: '0x4a29e0442ef2253e200a7078a24ebb9990ec401fbbbe2d46b55eb39cbdf3922d'
};
const DummyToken = {
    name: 'DummyToken',
    symbol: 'DTK',
    decimals: 18,
    address: '0xe1dbc5322f68e3e0bee9200c0060f153c3efd1fc'
};
const DummyWETH = {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x94f750fc94292eaae0704a16935733f8eea2ae98'
};
// const TEST_ACCOUNT={addr: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
// pk:'0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'};

const TEST_TOKEN_1 = {
    addr: '0xcfed223fab2a41b5a5a5f9aaae2d1e882cb6fe2d',
    decimals: 18,
    symbol: 'TTT1',
    name: 'TTT1'
};
const TEST_TOKEN_2 = {
    addr: '0x8273e4b8ed6c78e252a9fca5563adfcc75c91b2a',
    decimals: 0,
    symbol: 'TTT1',
    name: 'TTT1'
};

describe('dex', () => {
    let dex: Dex;
    let signerForT1;
    let signerForT2;
    beforeAll(async () => {
        const config: DexConfig = {
            network: 'kovan',
            portalAddr: '0x2c1a328ee62842c034eb05d354219210c21b7c04'
        };
        dex = await Dex.create(config);
        signerForT1 = new Wallet(TEST_ACCOUNT.pk, dex.eth);
        signerForT2 = new Wallet(TEST_ACCOUNT2.pk, dex.eth);
    });

    it('generatePseudoRandomSalt', () => {
        const salt = Dex.generatePseudoRandomSalt();
        console.log(salt);
        expect(salt).to.be.not.undefined;
    });

    it('sign order', async () => {
        const order: PlainUnsignedOrder = {
            maker: '0x2c035b186c3367a8c874aefbbad17cf5d4342ad4',
            taker: '0x0000000000000000000000000000000000000000',
            makerFeeRate: '0',
            takerFeeRate: '0',
            makerTokenAmount: '710205945664628717',
            takerTokenAmount: '887757432080785896',
            makerTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            takerTokenAddress: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
            salt: '56135933842534893576798448344855200909484663523954095590216455407188268309052',
            exchangeContractAddress: '0x6A7BaC0076e10C4326d485C4cA64Eba1567FA63c',
            makerFeeRecipient: '0x0000000000000000000000000000000000000000',
            expirationUnixTimestampSec: 1575279623
        };
        const orderHash = orderUtil.getOrderHashHex(order);
        const signature = await dex.signOrderHash(signerForT2, orderHash);
        const signed = {...order, ecSignature: signature};
        await dex.exchange.availableVolume(signed);
    });

    describe('trade', () => {
        const makerBalance = String(10 ** 16);
        const takerBalance = String(10 ** 16);
        const maker = TEST_ACCOUNT;
        let makerToken: ERC20Contract;
        const taker = TEST_ACCOUNT2;
        let takerToken: ERC20Contract;
        const makerFeeAccount = TEST_ACCOUNT3.addr;
        const takerFeeAccount = TEST_ACCOUNT4.addr;
        const exFeeAccount = TEST_ACCOUNT5.addr;
        let exchangeAddr;

        beforeAll(async () => {
            makerToken = await dex.token.getToken(DummyToken.address);
            takerToken = await dex.token.getToken(DummyWETH.address);
            exchangeAddr = dex.exchange.getContractAddress();
            const proxyAddr = await dex.exchange.tokenTransferProxy();
            await ensureGatewayAllowance(dex, signerForT1, maker.addr, makerToken.addr);
            await ensureGatewayAllowance(dex, signerForT2, taker.addr, takerToken.addr);

            const curFeeAccount = await dex.exchange.feeAccount();
            if (curFeeAccount.toLowerCase() !== exFeeAccount.toLowerCase()) {
                await (await dex.exchange.changeFeeAccount(
                    signerForT1,
                    exFeeAccount,
                    getGasOption(SCENES.TRANSFER)
                )).wait();
            }
            const transferProxy = new TokenTransferProxy(dex.eth, dex.config.network, proxyAddr);

            const isAuthed = await transferProxy.isAuthorized(exchangeAddr);
            if (!isAuthed) {
                await (await transferProxy.addAuthorizedAddress(
                    signerForT1,
                    exchangeAddr,
                    getGasOption(SCENES.TRANSFER)
                )).wait();
            }
            await ensureBalance(dex.eth, maker.addr, makerToken.addr, makerBalance);
            await ensureBalance(dex.eth, taker.addr, takerToken.addr, takerBalance);
        });

        it('normal trade - fully', async () => {
            const makerFeeRate = String(10 ** 15);
            const takerFeeRate = String(10 ** 15);
            const makerTokenAmount = '1000';
            const takerTokenAmount = '2000';

            const fillAmount = '2000';
            expect((await makerToken.balanceOf(maker.addr)).toString()).to.be.eq(makerBalance);
            expect((await takerToken.balanceOf(taker.addr)).toString()).to.be.eq(takerBalance);

            const order: PlainUnsignedOrder = {
                maker: maker.addr,
                taker: constants.NULL_ADDRESS,
                makerFeeRecipient: makerFeeAccount,
                makerTokenAddress: makerToken.addr,
                takerTokenAddress: takerToken.addr,
                exchangeContractAddress: exchangeAddr,
                salt: Dex.generatePseudoRandomSalt(),
                makerFeeRate: makerFeeRate,
                takerFeeRate: takerFeeRate,
                makerTokenAmount: makerTokenAmount, // Base 18 decimals
                takerTokenAmount: takerTokenAmount, // Base 18 decimals
                expirationUnixTimestampSec: Math.round((Date.now() + 3600000) / 1000)
            };
            const signed = await dex.signOrder(signerForT1, order);
            expect(orderUtil.isValidOrder(signed)).to.eq(true);
            const isValid = await dex.exchange.isValidSignature(
                maker.addr,
                getOrderHashHex(signed),
                signed.ecSignature
            );
            expect(isValid).to.eq(true);

            const av = await dex.exchange.availableVolume(signed);
            expect(av.toString()).to.eq(takerTokenAmount);
            const balanceBefore = await queryBalance(dex, [maker.addr, taker.addr], [makerToken.addr, takerToken.addr]);
            const tx = await dex.exchange.fillOrder(
                signerForT2,
                signed,
                fillAmount.toString(),
                takerFeeAccount,
                false,
                getGasOption(SCENES.TRADE)
            );

            await tx.wait();
            const balanceAfter = await queryBalance(dex, [maker.addr, taker.addr], [makerToken.addr, takerToken.addr]);
            expect(
                balanceAfter[taker.addr][makerToken.addr].sub(balanceBefore[taker.addr][makerToken.addr]).toString()
            ).to.eq(makerTokenAmount);
            expect(
                balanceAfter[maker.addr][takerToken.addr].sub(balanceBefore[maker.addr][takerToken.addr]).toString()
            ).to.eq(takerTokenAmount);
        });
        //
        //     it('batch trade - fillOrdersUpTo', async () => {
        //         const eth = dex.eth;
        //         const makerFeeRate = new BigNumber(10 ** 15);
        //         const takerFeeRate = new BigNumber(10 ** 15);
        //         const makerTokenAmount = new BigNumber(1000);
        //         const takerTokenAmount = new BigNumber(2000);
        //         const makerBalance = new BigNumber(10 ** 16);
        //         const takerBalance = new BigNumber(10 ** 16);
        //
        //         const fillAmount = new BigNumber(3000);
        //         await setBalance(eth, makerToken.addr, maker.addr, makerBalance, {
        //             ...gas,
        //             from: TEST_ACCOUNT.addr
        //         });
        //         await setBalance(eth, takerToken.addr, taker.addr, takerBalance, {
        //             ...gas,
        //             from: TEST_ACCOUNT.addr
        //         });
        //         expect((await makerToken.balanceOf(maker.addr)).toString()).to.be.eq(makerBalance.toString());
        //         expect((await takerToken.balanceOf(taker.addr)).toString()).to.be.eq(takerBalance.toString());
        //
        //         const order1: Order = {
        //             maker: maker.addr,
        //             taker: constants.NULL_ADDRESS,
        //             makerFeeRecipient: makerFeeAccount,
        //             makerTokenAddress: makerToken.addr,
        //             takerTokenAddress: takerToken.addr,
        //             exchangeContractAddress: exchangeAddr,
        //             salt: Dex.generatePseudoRandomSalt(),
        //             makerFeeRate,
        //             takerFeeRate,
        //             makerTokenAmount: new BigNumber(makerTokenAmount), // Base 18 decimals
        //             takerTokenAmount: new BigNumber(takerTokenAmount), // Base 18 decimals
        //             expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000) // Valid for up to an hour
        //         };
        //         const orderHash1 = Dex.getOrderHashHex(order1);
        //         const ecSignature1 = await dex.signOrderHashAsync(orderHash1, maker.addr, true);
        //         const signedOrder1: SignedOrder = {...order1, ecSignature: ecSignature1};
        //
        //         const order2: Order = {
        //             maker: maker.addr,
        //             taker: constants.NULL_ADDRESS,
        //             makerFeeRecipient: makerFeeAccount,
        //             makerTokenAddress: makerToken.addr,
        //             takerTokenAddress: takerToken.addr,
        //             exchangeContractAddress: exchangeAddr,
        //             salt: Dex.generatePseudoRandomSalt(),
        //             makerFeeRate,
        //             takerFeeRate,
        //             makerTokenAmount: new BigNumber(makerTokenAmount), // Base 18 decimals
        //             takerTokenAmount: new BigNumber(takerTokenAmount), // Base 18 decimals
        //             expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000) // Valid for up to an hour
        //         };
        //         const orderHash2 = Dex.getOrderHashHex(order2);
        //         const ecSignature2 = await dex.signOrderHashAsync(orderHash2, maker.addr, true);
        //         const signedOrder2: SignedOrder = {...order2, ecSignature: ecSignature2};
        //
        //         const receipt = await toReceiptPromise(
        //             dex.exchange.fillOrdersUpTo(
        //                 taker.addr,
        //                 [signedOrder1, signedOrder2],
        //                 fillAmount,
        //                 takerFeeAccount,
        //                 false,
        //                 gas
        //             )
        //         );
        //     });
    });
});
