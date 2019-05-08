import {Signer, Wallet} from 'ethers';
import {Provider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {Dex} from '../../src';
import {ERC20Contract} from '../../src/contracts/ERC20Contract';
import {AnyNumber} from '../../src/types';
import {assert} from '../../src/utils/assert';
import {getGasOption, SCENES} from '../../src/utils/gasUtil';
import {setBalance} from './dummyTokenUtil';

const ADMIN = {
    addr: '0x2E6b089dA137f83030229ce1E2D715969E0B36F8',
    pk: '0xf3ef78cff99391d22fc4d49cd728d83b43a7abc3d2f147887a5f1a2a1b1ac47d'
};
const signer = new Wallet(ADMIN.pk);

export async function ensureBalance(eth: Provider, user: string, token: string, amount: AnyNumber): Promise<void> {
    if (!token) {
        const balance = (await eth.getBalance(user)).sub(0.1);
        if (balance.lt(amount)) {
            throw new Error('balance not enough');
        }
    } else {
        const ethToken = new ERC20Contract({addr: token}, eth);
        const balance = await ethToken.balanceOf(user);
        if (balance.lt(amount)) {
            await (await setBalance(
                eth,
                signer.connect(eth),
                token,
                user,
                amount,
                getGasOption(SCENES.TRANSFER)
            )).wait();
        }
    }
}

export async function ensureGatewayAllowance(dex: Dex, signer: Signer, user: string, token: string): Promise<void> {
    assert.assert((await signer.getAddress()) === user, 'wrong signer');
    const threshhold = '10000000000000000000000000000000000000000000000000000000000000000000000';
    const allowance = await dex.token.allowanceForGateway(token, user);
    if (allowance.lt(threshhold)) {
        await (await dex.token.approveGateway(signer, token, getGasOption(SCENES.TRANSFER))).wait();
    }
}

type BalanceMap = {[user: string]: {[token: string]: BigNumber}};
export async function queryBalance(dex: Dex, users: string[], tokens: string[]): Promise<BalanceMap> {
    const res: BalanceMap = {};
    for (const token of tokens) {
        const tokenContract = await dex.token.getToken(token);
        for (const user of users) {
            const balance = await tokenContract.balanceOf(user);
            res[user] = res[user] || {};
            res[user][token] = balance;
        }
    }
    return res;
}
