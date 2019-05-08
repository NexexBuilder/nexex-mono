import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ethUtil from 'ethereumjs-util';
import Eth from 'web3/eth';
import {Dex} from '../src/dex';
import {DexConfig} from '../src/types';
import {getGasOption, SCENES} from '../src/utils/gasUtil';
import {createProviderEngine, engineConfig} from './utils/engineHelper';

chai.use(chaiAsPromised);
const expect = chai.expect;

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
const WETH = {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
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
    symbol: 'TTT2',
    name: 'TTT2'
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

const TKN3 = {
    addr: '0x16f8fc72371fe095a625e67135a9a994224f0a4a',
    decimals: 0,
    symbol: 'TNK3',
    name: 'TKN3 Test Token'
};

const TKN4 = {
    addr: '0x0d8d60a676127402ca3cc1a404d1dcea9268005e',
    decimals: 18,
    symbol: 'TNK4',
    name: 'TKN4 Test Token'
};

const TKN5 = {
    addr: '0x9a22af0ddaa711cc61806f1521cdd39782dc501e',
    decimals: 10,
    symbol: 'TNK5',
    name: 'TKN5 Test Token'
};

describe('dex', () => {
    let dex: Dex;
    let eth: Eth;
    let gas;
    beforeAll(async () => {
        const config: DexConfig = {
            network: 'kovan',
            portalAddr: '0x2c1a328ee62842c034eb05d354219210c21b7c04'
        };
        const provider = createProviderEngine(engineConfig([TEST_ACCOUNT, TEST_ACCOUNT2]), config.network);
        dex = new Dex(provider, config);
        eth = dex.eth;
        gas = getGasOption(SCENES.TRADE);
    });

    // beforeEach(async () => {
    //     try {
    //         await dex.tokenRegistry.removeToken(TEST_ACCOUNT.addr, TEST_TOKEN_1.addr, gas);
    //     } catch (e) {
    //     }
    //     try {
    //         await dex.tokenRegistry.removeToken(TEST_ACCOUNT.addr, TEST_TOKEN_2.addr, gas);
    //     } catch (e) {
    //     }
    // });

    it('can add token', async () => {
        await dex.tokenRegistry.addToken(
            TEST_ACCOUNT.addr,
            TEST_TOKEN_1.addr,
            TEST_TOKEN_1.name,
            TEST_TOKEN_1.symbol,
            TEST_TOKEN_1.decimals,
            '0x00',
            '0x00',
            gas
        );
        const token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token.addr).to.eq(ethUtil.toChecksumAddress(TEST_TOKEN_1.addr));
        expect(token.name).to.eq(TEST_TOKEN_1.name);
        expect(token.symbol).to.eq(TEST_TOKEN_1.symbol);
        expect(token.decimals).to.eq(TEST_TOKEN_1.decimals);
    });

    it('can remove token', async () => {
        await dex.tokenRegistry.addToken(
            TEST_ACCOUNT.addr,
            TEST_TOKEN_1.addr,
            TEST_TOKEN_1.name,
            TEST_TOKEN_1.symbol,
            TEST_TOKEN_1.decimals,
            '0x00',
            '0x00',
            gas
        );
        const token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token).to.not.undefined;
        await dex.tokenRegistry.removeToken(TEST_ACCOUNT.addr, TEST_TOKEN_1.addr, gas);
        const tokenAfter = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(tokenAfter).to.be.null;
    });

    it('can set token name', async () => {
        const newName = 'ANOTHER NAME';
        const [] = [
            await dex.tokenRegistry.addToken(
                TEST_ACCOUNT.addr,
                TEST_TOKEN_1.addr,
                TEST_TOKEN_1.name,
                TEST_TOKEN_1.symbol,
                TEST_TOKEN_1.decimals,
                '0x00',
                '0x00',
                gas
            ),
            await dex.tokenRegistry.addToken(
                TEST_ACCOUNT.addr,
                TEST_TOKEN_2.addr,
                TEST_TOKEN_2.name,
                TEST_TOKEN_2.symbol,
                TEST_TOKEN_2.decimals,
                '0x00',
                '0x00',
                gas
            )
        ];
        let token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token.name).to.eq(TEST_TOKEN_1.name);
        expect(dex.tokenRegistry.setTokenName(TEST_ACCOUNT.addr, TEST_TOKEN_1.addr, TEST_TOKEN_2.name, gas)).to.be
            .rejected;
        token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token.name).to.eq(TEST_TOKEN_1.name);
        await dex.tokenRegistry.setTokenName(TEST_ACCOUNT.addr, TEST_TOKEN_1.addr, newName, gas);
        token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token.name).to.eq(newName);
    });

    it('can set token symbol', async () => {
        const newSymbol = 'ASM';
        const [] = [
            await dex.tokenRegistry.addToken(
                TEST_ACCOUNT.addr,
                TEST_TOKEN_1.addr,
                TEST_TOKEN_1.name,
                TEST_TOKEN_1.symbol,
                TEST_TOKEN_1.decimals,
                '0x00',
                '0x00',
                gas
            ),
            await dex.tokenRegistry.addToken(
                TEST_ACCOUNT.addr,
                TEST_TOKEN_2.addr,
                TEST_TOKEN_2.name,
                TEST_TOKEN_2.symbol,
                TEST_TOKEN_2.decimals,
                '0x00',
                '0x00',
                gas
            )
        ];
        let token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token.symbol).to.eq(TEST_TOKEN_1.symbol);
        expect(dex.tokenRegistry.setTokenSymbol(TEST_ACCOUNT.addr, TEST_TOKEN_1.addr, TEST_TOKEN_2.symbol, gas)).to.be
            .rejected;
        token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token.symbol).to.eq(TEST_TOKEN_1.symbol);
        await dex.tokenRegistry.setTokenSymbol(TEST_ACCOUNT.addr, TEST_TOKEN_1.addr, newSymbol, gas);
        token = await dex.tokenRegistry.getTokenMetaData(TEST_TOKEN_1.addr);
        expect(token.symbol).to.eq(newSymbol);
    });

    it('can get all addresses', async () => {
        const newSymbol = 'ASM';
        const [] = [
            await dex.tokenRegistry.addToken(
                TEST_ACCOUNT.addr,
                TEST_TOKEN_1.addr,
                TEST_TOKEN_1.name,
                TEST_TOKEN_1.symbol,
                TEST_TOKEN_1.decimals,
                '0x00',
                '0x00',
                gas
            ),
            await dex.tokenRegistry.addToken(
                TEST_ACCOUNT.addr,
                TEST_TOKEN_2.addr,
                TEST_TOKEN_2.name,
                TEST_TOKEN_2.symbol,
                TEST_TOKEN_2.decimals,
                '0x00',
                '0x00',
                gas
            )
        ];
        const tokens = await dex.tokenRegistry.getTokenAddresses();
        expect(tokens).to.include(ethUtil.toChecksumAddress(TEST_TOKEN_1.addr));
        expect(tokens).to.include(ethUtil.toChecksumAddress(TEST_TOKEN_2.addr));
        expect(await dex.tokenRegistry.getTokenAddressBySymbol(TEST_TOKEN_1.symbol)).to.eq(
            ethUtil.toChecksumAddress(TEST_TOKEN_1.addr)
        );
        expect(await dex.tokenRegistry.getTokenAddressByName(TEST_TOKEN_1.name)).to.eq(
            ethUtil.toChecksumAddress(TEST_TOKEN_1.addr)
        );
        let token = await dex.tokenRegistry.getTokenByName(TEST_TOKEN_1.name);
        expect(token).to.deep.eq({
            addr: ethUtil.toChecksumAddress(TEST_TOKEN_1.addr),
            symbol: TEST_TOKEN_1.symbol,
            name: TEST_TOKEN_1.name,
            decimals: TEST_TOKEN_1.decimals,
            ipfsHash: '0x00',
            swarmHash: '0x00'
        });
        expect(await dex.tokenRegistry.getTokenBySymbol(TEST_TOKEN_1.symbol)).to.deep.eq({
            addr: ethUtil.toChecksumAddress(TEST_TOKEN_1.addr),
            symbol: TEST_TOKEN_1.symbol,
            name: TEST_TOKEN_1.name,
            decimals: TEST_TOKEN_1.decimals,
            ipfsHash: '0x00',
            swarmHash: '0x00'
        });
    });

    it.only('can ttt token', async () => {
        // try {
        //     await dex.tokenRegistry.removeToken(TEST_ACCOUNT.addr, DummyWETH.address, gas);
        // } catch (e) {
        // }
        const MKR = {
            address: '0x1Dad4783cf3fe3085C1426157aB175A6119A04bA',
            symbol: 'MKR',
            name: 'MakerDAO',
            decimals: 18
        };
        await dex.tokenRegistry.addToken(
            TEST_ACCOUNT.addr,
            WETH.address,
            WETH.symbol,
            WETH.name,
            WETH.decimals,
            '0x00',
            '0x00',
            gas
        );
    });
});
