import {Artifact, ECSignature, PlainDexOrder} from '@nexex/types';
import {Signer} from 'ethers';
import {TransactionRequest, TransactionResponse} from 'ethers/providers';
import {BigNumber} from 'ethers/utils/bignumber';
import {artifacts} from '../artifacts';
import * as decorators from '../decorators';
import {AnyNumber} from '../types';
import {BaseContract} from './BaseContract';

export class Exchange extends BaseContract {
    async feeAccount(): Promise<string> {
        return this.contract.feeAccount();
    }

    @decorators.validate
    async changeFeeAccount(
        signer: Signer,
        @decorators.validators.ethAddressHex newFeeAccount: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).changeFeeAccount(newFeeAccount, opt);
    }

    async makerExFeeRate(): Promise<BigNumber> {
        return this.contract.makerExFeeRate();
    }

    @decorators.validate
    async changeFeeMake(
        signer: Signer,
        newMakeFeeRate: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).changeFeeMake(newMakeFeeRate, opt);
    }

    async takerExFeeRate(): Promise<BigNumber> {
        return this.contract.takerExFeeRate();
    }

    @decorators.validate
    async changeFeeTake(
        signer: Signer,
        newTakeFeeRate: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).changeFeeTake(newTakeFeeRate, opt);
    }

    async tokenTransferProxy(): Promise<string> {
        return this.contract.tokenTransferProxy();
    }

    @decorators.validate
    async changeTokenTransferProxy(
        signer: Signer,
        @decorators.validators.ethAddressHex newTokenTransferProxy: string,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).changeTokenTransferProxy(newTokenTransferProxy, opt);
    }

    async maxMakerFeeRate(): Promise<BigNumber> {
        return this.contract.maxMakerFeeRate();
    }

    @decorators.validate
    async changeMaxMakerFeeRate(
        signer: Signer,
        newFeeRate: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).changeMaxMakerFeeRate(newFeeRate, opt);
    }

    async maxTakerFeeRate(): Promise<BigNumber> {
        return this.contract.maxTakerFeeRate();
    }

    @decorators.validate
    async changeMaxTakerFeeRate(
        signer: Signer,
        newFeeRate: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract.connect(signer).changeMaxTakerFeeRate(newFeeRate, opt);
    }

    async isValidOrder(order: PlainDexOrder): Promise<boolean> {
        return this.contract.isValidOrder(
            this.extractOrderAddressArray(order),
            this.extractOrderValueArray(order),
            order.ecSignature.v,
            order.ecSignature.r,
            order.ecSignature.s
        );
    }

    @decorators.validate
    async isValidSignature(
        @decorators.validators.ethAddressHex maker: string,
        orderHash: string,
        ecSignature: ECSignature
    ): Promise<boolean> {
        return this.contract.isValidSignature(maker, orderHash, ecSignature.v, ecSignature.r, ecSignature.s);
    }

    @decorators.validate
    async availableVolume(@decorators.validators.exchangeOrder order: PlainDexOrder): Promise<BigNumber> {
        return this.contract.availableVolume(
            this.extractOrderAddressArray(order),
            this.extractOrderValueArray(order),
            order.ecSignature.v,
            order.ecSignature.r,
            order.ecSignature.s
        );
    }

    @decorators.validate
    async testFillOrder(
        order: PlainDexOrder,
        fillAmount: AnyNumber,
        takerFeeAccount: string,
        @decorators.validators.ethAddressHex taker: string
    ): Promise<boolean> {
        return this.contract.testFillOrder(
            this.extractOrderAddressArray(order),
            this.extractOrderValueArray(order),
            fillAmount,
            takerFeeAccount,
            taker,
            order.ecSignature.v,
            order.ecSignature.r,
            order.ecSignature.s
        );
    }

    @decorators.validate
    fillOrder(
        signer: Signer,
        order: PlainDexOrder,
        fillAmount: AnyNumber,
        @decorators.validators.ethAddressHex takerFeeAccount: string,
        shouldThrowOnInsufficientBalanceOrAllowance: boolean,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract
            .connect(signer)
            .fillOrder(
                this.extractOrderAddressArray(order),
                this.extractOrderValueArray(order),
                fillAmount,
                takerFeeAccount,
                shouldThrowOnInsufficientBalanceOrAllowance,
                order.ecSignature.v,
                order.ecSignature.r,
                order.ecSignature.s,
                opt
            );
    }

    @decorators.validate
    fillOrdersUpTo(
        signer: Signer,
        orders: Array<PlainDexOrder>,
        fillAmount: AnyNumber,
        @decorators.validators.ethAddressHex takerFeeAccount: string,
        shouldThrowOnInsufficientBalanceOrAllowance: boolean,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        const addr2DArray = orders.map(order => this.extractOrderAddressArray(order));
        const value2DArray = orders.map(order => this.extractOrderValueArray(order));
        return this.contract
            .connect(signer)
            .fillOrdersUpTo(
                addr2DArray,
                value2DArray,
                fillAmount,
                takerFeeAccount,
                shouldThrowOnInsufficientBalanceOrAllowance,
                orders.map(order => order.ecSignature.v),
                orders.map(order => order.ecSignature.r),
                orders.map(order => order.ecSignature.s),
                opt
            );
    }

    @decorators.validate
    batchFillOrders(
        signer: Signer,
        orders: Array<PlainDexOrder>,
        fillAmounts: Array<AnyNumber>,
        @decorators.validators.ethAddressHex takerFeeAccount: string,
        shouldThrowOnInsufficientBalanceOrAllowance: boolean,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        const addr2DArray = orders.map(order => this.extractOrderAddressArray(order));
        const value2DArray = orders.map(order => this.extractOrderValueArray(order));
        return this.contract
            .connect(signer)
            .fillOrdersUpTo(
                addr2DArray,
                value2DArray,
                fillAmounts,
                takerFeeAccount,
                shouldThrowOnInsufficientBalanceOrAllowance,
                orders.map(order => order.ecSignature.v),
                orders.map(order => order.ecSignature.r),
                orders.map(order => order.ecSignature.s),
                opt
            );
    }

    @decorators.validate
    batchFillOrKillOrders(
        signer: Signer,
        orders: Array<PlainDexOrder>,
        fillAmounts: Array<AnyNumber>,
        @decorators.validators.ethAddressHex takerFeeAccount: string,
        shouldThrowOnInsufficientBalanceOrAllowance: boolean,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        const addr2DArray = orders.map(order => this.extractOrderAddressArray(order));
        const value2DArray = orders.map(order => this.extractOrderValueArray(order));
        return this.contract
            .connect(signer)
            .fillOrdersUpTo(
                addr2DArray,
                value2DArray,
                fillAmounts,
                takerFeeAccount,
                shouldThrowOnInsufficientBalanceOrAllowance,
                orders.map(order => order.ecSignature.v),
                orders.map(order => order.ecSignature.r),
                orders.map(order => order.ecSignature.s),
                opt
            );
    }

    async cancelOrder(
        signer: Signer,
        order: PlainDexOrder,
        cancelTakerAmount?: AnyNumber,
        opt: TransactionRequest = {}
    ): Promise<TransactionResponse> {
        return this.contract
            .connect(signer)
            .cancelOrder(
                this.extractOrderAddressArray(order),
                this.extractOrderValueArray(order),
                cancelTakerAmount || order.takerTokenAmount,
                opt
            );
    }

    async getOrderHash(order: PlainDexOrder): Promise<string> {
        return this.contract.getOrderHash(this.extractOrderAddressArray(order), this.extractOrderValueArray(order));
    }

    protected getArtifact(): Artifact {
        return artifacts.ExchangeArtifact;
    }

    private extractOrderAddressArray(order: PlainDexOrder): string[] {
        return [order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.makerFeeRecipient];
    }

    private extractOrderValueArray(order: PlainDexOrder): string[] {
        return [
            order.makerTokenAmount,
            order.takerTokenAmount,
            order.makerFeeRate,
            order.takerFeeRate,
            order.expirationUnixTimestampSec.toString(),
            order.salt
        ];
    }
}
