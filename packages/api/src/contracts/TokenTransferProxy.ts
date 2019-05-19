import {Artifact} from '@nexex/types';
import {Signer} from 'ethers';
import {TransactionRequest, TransactionResponse} from 'ethers/providers';
import {artifacts} from '../artifacts';
import * as decorators from '../decorators';
import {OwnableContract} from './OwnableContract';

export class TokenTransferProxy extends OwnableContract {
    async isAuthorized(addr: string): Promise<boolean> {
        return this.contract.authorized(addr);
    }

    async authorities(): Promise<string[]> {
        return this.contract.authorities();
    }

    @decorators.validate
    async addAuthorizedAddress(
        signer: Signer,
        target: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).addAuthorizedAddress(target, opt);
    }

    @decorators.validate
    async removeAuthorizedAddress(
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
