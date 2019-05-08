import {ERC20Token} from '@nexex/types';
import {Contract, ethers, Signer} from 'ethers';
import {Provider, TransactionRequest, TransactionResponse} from 'ethers/providers';
import {artifacts} from '../artifacts';
import * as decorators from '../decorators';
import {Amount} from '../model/Amount';
import {AnyNumber} from '../types';

export class ERC20Contract implements ERC20Token {
    public contract: Contract;
    public token: ERC20Token;
    private readonly provider: Provider;

    constructor(token: ERC20Token, provider: Provider) {
        this.token = token;
        this.provider = provider;
        this.contract = new ethers.Contract(token.addr, artifacts.ERC20TokenArtifact.abi, this.provider);
    }

    public get decimals(): number | null {
        return this.token.decimals;
    }

    public get name(): string | null {
        return this.token.name;
    }

    public get symbol(): string | null {
        return this.token.symbol;
    }

    public get addr(): string | null {
        return this.token.addr;
    }

    // public setEth(eth: Eth): void {
    //     this.contract.setProvider(eth.currentProvider);
    // }

    public async allowance(owner: string, spender: string): Promise<Amount> {
        const ret = await this.contract.allowance(owner, spender);
        return new Amount(ret, this.decimals);
    }

    @decorators.validate
    public approve(
        signer: Signer,
        @decorators.validators.ethAddressHex spender: string,
        amount: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).approve(spender, amount, opt);
    }

    @decorators.validate
    public async balanceOf(@decorators.validators.ethAddressHex addr: string): Promise<Amount> {
        const balance = await this.contract.balanceOf(addr);
        return new Amount(balance, this.decimals);
    }

    @decorators.validate
    public transfer(
        signer: Signer,
        @decorators.validators.ethAddressHex toAddr: string,
        amount: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).transfer(toAddr, amount, opt);
    }

    @decorators.validate
    public transferFrom(
        signer: Signer,
        @decorators.validators.ethAddressHex fromAddr: string,
        @decorators.validators.ethAddressHex toAddr: string,
        amount: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).transferFrom(fromAddr, toAddr, amount, opt);
    }

    public async totalSupply(): Promise<Amount> {
        const ret = await this.contract.totalSupply();
        return new Amount(ret, this.decimals);
    }
}
