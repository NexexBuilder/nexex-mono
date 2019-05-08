import BigNumber from 'bignumber.js';
import {autoserialize, autoserializeAs} from 'cerialize';
import {ECSignature} from '@nexex/types';
import {bn2HexSerializer, bnSec2dateSerializer, bnSerializer, lowerCaseSerializer} from '../utils/serializers';

export class SignedOrderDto {
    @autoserializeAs(lowerCaseSerializer)
    public maker: string;
    @autoserializeAs(lowerCaseSerializer)
    public taker: string;
    @autoserializeAs(bnSerializer)
    public makerFeeRate: BigNumber;
    @autoserializeAs(bnSerializer)
    public takerFeeRate: BigNumber;
    @autoserializeAs(bnSerializer)
    public makerTokenAmount: BigNumber;
    @autoserializeAs(bnSerializer)
    public takerTokenAmount: BigNumber;
    @autoserializeAs(lowerCaseSerializer)
    public makerTokenAddress: string;
    @autoserializeAs(lowerCaseSerializer)
    public takerTokenAddress: string;
    @autoserializeAs(bn2HexSerializer)
    public salt: BigNumber;
    @autoserialize
    public exchangeContractAddress: string;
    @autoserialize
    public makerFeeRecipient: string;
    @autoserializeAs(bnSec2dateSerializer)
    public expirationUnixTimestampSec: BigNumber;
    @autoserialize
    public ecSignature: ECSignature;
}
