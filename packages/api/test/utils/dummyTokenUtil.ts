import {ethers, Signer} from 'ethers';
import {Provider, TransactionRequest, TransactionResponse} from 'ethers/providers';
import {AnyNumber} from '../../src/types';

const artifact = require('@nexex/contract/dist/artifacts/DummyToken.json');

export async function setBalance(
    eth: Provider,
    signer: Signer,
    tokenAddr: string,
    user: string,
    amount: AnyNumber,
    opt: TransactionRequest = {}
): Promise<TransactionResponse> {
    const contract = new ethers.Contract(tokenAddr, artifact.abi, eth);
    return contract.connect(signer).setBalance(user, amount, opt);
}
