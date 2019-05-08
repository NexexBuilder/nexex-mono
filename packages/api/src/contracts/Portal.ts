import {Artifact} from '@nexex/types';
import {Signer} from 'ethers';
import {TransactionRequest, TransactionResponse} from 'ethers/providers';
import {artifacts} from '../artifacts';
import {PortalEntry} from '../constants';
import * as decorators from '../decorators';
import {assert} from '../utils/assert';
import {OwnableContract} from './OwnableContract';
import {getAddress} from 'ethers/utils';

export class Portal extends OwnableContract {
    @decorators.validate
    public async setEntry(
        signer: Signer,
        portalEntry: PortalEntry,
        @decorators.validators.ethAddressHex addr: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        const [signerAddr, owner] = [await signer.getAddress(), await this.owner()];
        assert.assert(getAddress(signerAddr) === owner, 'only owner can set entry');

        return this.contract.connect(signer).setEntry(portalEntry, addr, opt);
    }

    /* call functions */
    public async portalEntries(index: number): Promise<string> {
        return this.contract.portalEntries(index);
    }

    protected getArtifact(): Artifact {
        return artifacts.PortalArtifact;
    }
}
