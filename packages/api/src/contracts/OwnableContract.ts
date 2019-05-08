import {Signer} from 'ethers';
import {TransactionRequest, TransactionResponse} from 'ethers/providers';
import * as decorators from '../decorators';
import {BaseContract} from './BaseContract';

export abstract class OwnableContract extends BaseContract {
    public async owner(): Promise<string> {
        return this.contract.owner();
    }

    @decorators.validate
    public async transferOwnership(
        signer: Signer,
        @decorators.validators.ethAddressHex newOwner: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).transferOwnership(newOwner, opt);
    }
}
