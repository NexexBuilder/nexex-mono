import {Button, FormGroup, Intent} from '@blueprintjs/core';
import {constants as DexConstants, Dex} from '@nexex/api';
import {OrderSide, PlainUnsignedOrder} from '@nexex/types';
import {Market, MarketConfig} from '@nexex/types/orderbook';
import BigNumber from 'bignumber.js';
import {utils} from 'ethers';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {AmountUnit} from '../../constants';
import {submitOrder} from '../../redux/actions/exchange.action';
import {updateFormField} from '../../redux/actions/ui/new_order_panel.action';
import {NewOrderPanelForm, NewOrderPanelState} from '../../redux/reducers/ui/new_order_panel.reducer';
import {
    getBaseTokenBalance,
    getBaseTokenEnableStatus,
    getMarketConfig,
    getQuoteTokenBalance,
    getQuoteTokenEnableStatus,
    getSelectedMarket
} from '../../redux/selectors';
import {SiteConfig} from '../../types';
import AmountInput from '../../ui-components/AmountInput/AmountInput';
import PriceInput from '../../ui-components/PriceInput/PriceInput';
import {Amount} from '../../utils/Amount';
import './style.scss';

interface NewOrderPanelProps {
    dispatch: Dispatch;
    config: SiteConfig;
    selectedMarket: Market;
    marketConfig: MarketConfig;
    baseTokenBalance: Amount;
    quoteTokenBalance: Amount;
    formData: NewOrderPanelForm;
    side: OrderSide;
    walletAddr: string;
    quoteTokenAmount?: Amount;
}

export class NewOrderPanel extends React.PureComponent<NewOrderPanelProps, {}> {
    static defaultProps = {};

    LimitPriceHelper = (props) =>
        <span className="limit-price-helper"><a>Best Ask</a><a>Best Bid</a></span>

    AmountHelper = (props) =>
        <span className="amount-helper">
            <a onClick={() => this.handleAmountHelperClick(0.25)}>25%</a>
            <a onClick={() => this.handleAmountHelperClick(0.5)}>50%</a>
            <a onClick={() => this.handleAmountHelperClick(0.75)}>75%</a>
            <a onClick={() => this.handleAmountHelperClick(1)}>100%</a>
        </span>

    render() {
        const {baseTokenBalance, formData, selectedMarket, quoteTokenAmount} = this.props;
        const {quote, base} = selectedMarket;
        const decimals = base.decimals;
        let total;
        if (formData.amount && formData.price) {
            total = formData.amount.toEther().times(formData.price).toFixed(5);
        }
        return <div className="dex-new-order-panel">
            <FormGroup
                label="Limit Price"
                labelFor="text-input"
                labelInfo={<this.LimitPriceHelper/>}
            >
                <PriceInput value={formData.price} onChange={this.handlePriceChange}
                            rightElement={<span
                                className="symbol-label">{quote.symbol}</span>}/>
            </FormGroup>
            <FormGroup
                label="Amount"
                labelFor="text-input"
                labelInfo={<this.AmountHelper/>}
            >
                <AmountInput max={baseTokenBalance} slider={false} decimals={decimals}
                             onChange={this.handleAmountChange} value={formData.amount}
                             rightElement={<span
                                 className="symbol-label">{base.symbol}</span>}/>
            </FormGroup>
            <div>
                <span>Total≈ {total} {base.symbol}</span>
                <span>Fee ≈ {quoteTokenAmount ? quoteTokenAmount.toString() : undefined} WETH</span>
            </div>
            <div>
                <Button fill intent={this.actionButtonIntent()} onClick={this.handleSubmitOrder}><Translate
                    id={this.actionButtonText()}/> {base.name}({base.symbol})</Button>
            </div>
        </div>;
    }

    actionButtonText = () => {
        if (this.props.side === OrderSide.ASK) {
            return 'new_order_panel.action.sell';
        } else {
            return 'new_order_panel.action.buy';
        }
    };

    actionButtonIntent = () => {
        if (this.props.side === OrderSide.ASK) {
            return Intent.DANGER;
        } else {
            return Intent.SUCCESS;
        }
    };

    handlePriceChange = (price: BigNumber) => this.props.dispatch(updateFormField(this.props.side, 'price', price));
    handleAmountChange = (amount: Amount) => this.props.dispatch(updateFormField(this.props.side, 'amount', amount));

    handleAmountHelperClick = (percentage: number) => {
        const {side} = this.props;
        if (side === OrderSide.ASK) {
            if (this.props.quoteTokenBalance) {
                this.props.dispatch(updateFormField(this.props.side, 'amount',
                    this.props.quoteTokenBalance.times(percentage)));
            }
        } else if (side === OrderSide.BID) {
            const {baseTokenBalance, formData: {price}} = this.props;
            if (baseTokenBalance && price && price.gt(0)) {
                this.props.dispatch(updateFormField(this.props.side, 'amount',
                    this.props.baseTokenBalance.div(this.props.formData.price).times(percentage)));
            }
        }
    };

    handleSubmitOrder = () => {
        const {dispatch, selectedMarket, marketConfig, config, formData} = this.props;
        const {base, quote} = selectedMarket;
        let makerTokenAddress: string, takerTokenAddress: string, makerTokenAmount: BigNumber,
            takerTokenAmount: BigNumber;
        if (this.props.side === OrderSide.ASK) {
            makerTokenAddress = base.addr;
            takerTokenAddress = quote.addr;
            makerTokenAmount = formData.amount.toWei();
            takerTokenAmount = formData.amount.toEther().times(formData.price).times(10 ** quote.decimals);
        } else {
            makerTokenAddress = quote.addr;
            takerTokenAddress = base.addr;
            takerTokenAmount = formData.amount.toWei();
            makerTokenAmount = formData.amount.toEther().times(formData.price).times(10 ** quote.decimals);
        }
        // TODO: add expire input
        const order: PlainUnsignedOrder = {
            maker: this.props.walletAddr,
            taker: DexConstants.NULL_ADDRESS,
            makerFeeRecipient: marketConfig.makerFeeRecipient,
            makerTokenAddress,
            takerTokenAddress,
            exchangeContractAddress: '',
            salt: Dex.generatePseudoRandomSalt(),
            makerFeeRate: utils.parseEther(marketConfig.minMakerFeeRate).toString(),
            takerFeeRate: utils.parseEther(config.takerFeeRate).toString(),
            makerTokenAmount: makerTokenAmount.toString(10), // Base 18 decimals
            takerTokenAmount: takerTokenAmount.toString(10), // Base 18 decimals
            expirationUnixTimestampSec: Math.round(Date.now() / 1000 + config.orderExpiration) // Valid for up to an hour
        };
        dispatch(submitOrder(order));
    }
}

export const getQuoteTokenAmount = (store, props) => {
    const newOrderPanel = store.ui.newOrderPanel as NewOrderPanelState;
    const formData = props.side === OrderSide.ASK ?
        newOrderPanel.formDataForSell :
        newOrderPanel.formDataForBuy;
    const {quote} = getSelectedMarket(store);
    if (formData.amount && formData.price) {
        return new Amount(formData.amount.toEther().times(formData.price), AmountUnit.ETHER, quote.decimals);
    }
};


const mapStateToProps = (store, props) => ({
    config: store.global.siteConfig,
    selectedMarket: getSelectedMarket(store),
    marketConfig: getMarketConfig(store),
    baseTokenBalance: getBaseTokenBalance(store),
    quoteTokenBalance: getQuoteTokenBalance(store),
    baseTokenEnableStatus: getBaseTokenEnableStatus(store),
    quoteTokenEnableStatus: getQuoteTokenEnableStatus(store),
    walletAddr: store.wallet.walletAddr,
    formData: props.side === OrderSide.ASK ? store.ui.newOrderPanel.formDataForSell :
        store.ui.newOrderPanel.formDataForBuy,
    quoteTokenAmount: getQuoteTokenAmount(store, props)

});

export default connect(mapStateToProps)(NewOrderPanel);
