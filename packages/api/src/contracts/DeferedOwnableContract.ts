// import {ethers} from 'ethers';
// import {Provider} from 'ethers/providers';
// import {defer, Defer} from '../utils/defer';
// import {OwnableContract} from './OwnableContract';
//
// export abstract class DeferedOwnableContract extends OwnableContract {
//     protected ready: Defer<void>;
//
//     constructor(eth: Provider, networ) {
//         super(eth, );
//         this.ready = defer();
//     }
//
//     public setContractAddr(addr: string): void {
//         this.addressIfExists = addr;
//         this.contract = new ethers.Contract(addr, this.getAbiDefinition(), this.eth);
//         this.ready.resolve();
//     }
// }
