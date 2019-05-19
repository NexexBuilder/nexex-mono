import {Artifact} from '@nexex/types';
import {Signer, utils} from 'ethers';
import {TransactionRequest, TransactionResponse} from 'ethers/providers';
import {artifacts} from '../artifacts';
import * as decorators from '../decorators';
import {AnyNumber} from '../types';
import {BaseContract} from './BaseContract';

export class WrappedETH extends BaseContract {
    @decorators.validate
    deposit(signer: Signer, amount: AnyNumber, opt: TransactionRequest = {}): Promise<TransactionResponse> {
        return this.contract.connect(signer).deposit({
            ...opt,
            value: utils.bigNumberify(amount)
        });
    }

    @decorators.validate
    withdraw(signer: Signer, amount: AnyNumber, opt: TransactionRequest = {}): Promise<TransactionResponse> {
        return this.contract.connect(signer).withdraw(amount, opt);
    }

    protected getArtifact(): Artifact {
        return artifacts.WETHArtifact;
    }
}
