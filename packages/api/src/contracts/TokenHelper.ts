import * as decorators from '@nexex/api/decorators';
import {ethers, Signer} from 'ethers';
import {Provider, TransactionRequest, TransactionResponse} from 'ethers/providers';
import {constants} from '../constants';
import {Amount, AmountUnit} from '../model/Amount';
import {AnyNumber} from '../types';
import {ERC20Contract} from './ERC20Contract';
import {WrappedETH} from './WrappedETH';

export class TokenHelper {
    gatewayAddr: string;
    protected provider: Provider;
    protected cache: {[addr: string]: ERC20Contract} = {};
    protected etherToken: WrappedETH;

    constructor(provider: Provider, private network: string, gatewayAddr: string, wrappedEthAddr: string) {
        this.provider = provider;
        this.gatewayAddr = gatewayAddr;
        this.etherToken = new WrappedETH(this.provider, this.network, wrappedEthAddr);
    }

    wrapEth(signer: Signer, amount: AnyNumber, opt: TransactionRequest = {}): Promise<TransactionResponse> {
        return this.etherToken.deposit(signer, amount, opt);
    }

    unwrapEth(signer: Signer, amount: AnyNumber, opt: TransactionRequest = {}): Promise<TransactionResponse> {
        return this.etherToken.withdraw(signer, amount, opt);
    }

    async approveGateway(
        signer: Signer,
        tokenAddr: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        const token = await this.getToken(tokenAddr);
        return token.approve(signer, this.gatewayAddr, constants.MAX_UINT_256, opt);
    }

    async revokeGatewayApproval(
        signer: Signer,
        tokenAddr: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        const token = await this.getToken(tokenAddr);
        return token.approve(signer, this.gatewayAddr, 0, opt);
    }

    @decorators.validate
    async getToken(@decorators.validators.ethAddressHex addr: string): Promise<ERC20Contract> {
        if (this.cache[addr]) {
            return this.cache[addr];
        } else {
            const [name, decimals, symbol] = [
                await this.name(addr),
                await this.decimals(addr),
                await this.symbol(addr)
            ];
            const ethToken = new ERC20Contract({name, decimals, symbol, addr}, this.provider);
            this.cache[addr] = ethToken;

            return ethToken;
        }
    }

    async balanceOf(tokenAddr: string, userAddr: string): Promise<Amount> {
        const token = await this.getToken(tokenAddr);
        return token.balanceOf(userAddr);
    }

    async allowanceForGateway(tokenAddr: string, userAddr: string): Promise<Amount> {
        const token = await this.getToken(tokenAddr);
        return token.allowance(userAddr, this.gatewayAddr);
    }

    async parseAmount(tokenAddr: string, displayAmount: string): Promise<Amount> {
        const token = await this.getToken(tokenAddr);
        const {decimals} = token;
        return new Amount(displayAmount, decimals, AmountUnit.DISPLAY);
    }

    async formatAmount(tokenAddr: string, weiAmount: AnyNumber): Promise<Amount> {
        const token = await this.getToken(tokenAddr);
        const {decimals} = token;
        return new Amount(weiAmount, decimals);
    }

    private async decimals(addr: string): Promise<number> {
        const data = ethers.utils.hexDataSlice(ethers.utils.id('decimals()'), 0, 4);
        const transaction = {
            to: addr,
            data: data
        };
        try {
            const result = await this.provider.call(transaction);
            return Number(result);
        } catch (e) {
            return 18;
        }
    }

    private async name(addr: string): Promise<string> {
        const data = ethers.utils.hexDataSlice(ethers.utils.id('name()'), 0, 4);
        const transaction = {
            to: addr,
            data: data
        };
        try {
            const result = await this.provider.call(transaction);
            const length = ethers.utils.hexDataLength(result);
            if (length === 32) {
                return ethers.utils.parseBytes32String(result);
            } else if (length > 32) {
                return ethers.utils.parseBytes32String(ethers.utils.hexDataSlice(result, length - 32));
            }
        } catch (e) {
            return '';
        }
    }

    private async symbol(addr: string): Promise<string> {
        const data = ethers.utils.hexDataSlice(ethers.utils.id('symbol()'), 0, 4);
        const transaction = {
            to: addr,
            data: data
        };

        try {
            const result = await this.provider.call(transaction);
            const length = ethers.utils.hexDataLength(result);
            if (length === 32) {
                return ethers.utils.parseBytes32String(result);
            } else if (length > 32) {
                return ethers.utils.parseBytes32String(ethers.utils.hexDataSlice(result, length - 32));
            }
        } catch (e) {
            return '';
        }
    }
}
