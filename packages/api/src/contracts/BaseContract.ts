import {Artifact} from '@nexex/types';
import {Contract, ethers} from 'ethers';
import {Provider} from 'ethers/providers';
import isUndefined from 'lodash/isUndefined';
import {constants} from '../constants';

export abstract class BaseContract {
    protected eth: Provider;
    protected network: string;
    protected addressIfExists: string;
    protected contract: Contract;

    constructor(eth: Provider, network: string, addressIfExists?: string) {
        this.eth = eth;
        this.addressIfExists = addressIfExists;
        this.network = network;
        this.contract = this.getContract();
    }

    getContractAddress(): string {
        const networkId = constants.NETWORK_ID[this.network.toUpperCase()];
        if (isUndefined(this.addressIfExists)) {
            const artifact = this.getArtifact();
            const contractAddress = artifact.networks[networkId.toString()].address;
            if (isUndefined(contractAddress)) {
                throw new Error('ContractDoesNotExist');
            }
            return contractAddress;
        } else {
            return this.addressIfExists;
        }
    }

    protected getContract(): Contract {
        if (!this.contract) {
            const addr = this.getContractAddress();
            if (!addr) {
                throw new Error('addr not found');
            }
            this.contract = new ethers.Contract(addr, this.getAbiDefinition(), this.eth);
        }

        return this.contract;
    }

    protected getAbiDefinition(): any {
        return this.getArtifact().abi;
    }

    protected abstract getArtifact(): Artifact;
}
