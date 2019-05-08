import {Artifact} from '@nexex/types';
import {Signer} from 'ethers';
import {TransactionRequest, TransactionResponse} from 'ethers/providers';
import {artifacts} from '../artifacts';
import * as decorators from '../decorators';
import {OwnableContract} from './OwnableContract';

export class TokenTransferProxy extends OwnableContract {
    public async isAuthorized(addr: string): Promise<boolean> {
        return this.contract.authorized(addr);
    }

    public async authorities(): Promise<string[]> {
        return this.contract.authorities();
    }

    @decorators.validate
    public async addAuthorizedAddress(
        signer: Signer,
        target: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).addAuthorizedAddress(target, opt);
    }

    @decorators.validate
    public async removeAuthorizedAddress(
        signer: Signer,
        target: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).removeAuthorizedAddress(target, opt);
    }

    protected getArtifact(): Artifact {
        return artifacts.TokenTransferProxyArtifact;
    }
}
