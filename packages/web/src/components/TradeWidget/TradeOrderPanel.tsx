import {Button, FormGroup, Intent} from '@blueprintjs/core';
import {Market} from '@nexex/orderbook-client';
import {OrderSide} from '@nexex/types';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {updateFormField} from '../../redux/actions/ui/new_order_panel.action';
import {TradeOrderPanelForm} from '../../redux/reducers/ui/trade_order_panel.reducer';
import {
    getBaseTokenBalance,
    getBaseTokenEnableStatus,
    getQuoteTokenBalance,
    getQuoteTokenEnableStatus
} from '../../redux/selectors';
import {FtOrder, SiteConfig} from '../../types';
import AmountInput from '../../ui-components/AmountInput/AmountInput';
import {Amount} from '../../utils/Amount';
import './style.scss';

interface TradeOrderPanelProps {
    dispatch: Dispatch;
    config: SiteConfig;
    selectedMarket: Market;
    baseTokenBalance: Amount;
    quoteTokenBalance: Amount;
    formData: TradeOrderPanelForm;
    walletAddr: string;
    selectedOrder: FtOrder;
}

class TradeOrderPanel extends React.PureComponent<TradeOrderPanelProps, {}> {
    static defaultProps = {};

    render() {
        const {baseTokenBalance, formData, selectedMarket, selectedOrder} = this.props;
        const {quote, base} = selectedMarket;
        return <div className="dex-new-order-panel">
            <FormGroup
                label="Limit Price"
                labelFor="text-input"
            >
                <div>{selectedOrder.price.toPrecision(8)}</div>
            </FormGroup>
            <FormGroup
                label="Amount"
                labelFor="text-input"
            >
                <AmountInput max={selectedOrder.remainingBaseTokenAmount} slider={false} decimals={base.decimals}
                             onChange={this.handleAmountChange} value={formData.baseTokenAmount}
                             rightElement={<span
                                 className="symbol-label">{selectedOrder.baseToken.symbol}</span>}/>
            </FormGroup>
            <div>
                <span>Total≈ {formData.quoteTokenAmount && formData.quoteTokenAmount.toEther().toFixed(5)}{quote.symbol}</span>
                <span>Fee ≈ ... WETH</span>
            </div>
            <div>
                <Button fill intent={this.actionButtonIntent()} onClick={this.handleSubmitOrder}><Translate
                    id={this.actionButtonText()}/> {quote.name}({quote.symbol})</Button>
            </div>
        </div>;
    }

    actionButtonText = () => {
        if (this.props.selectedOrder.side === OrderSide.ASK) {
            return 'trade_order_panel.action.buy';
        } else {
            return 'trade_order_panel.action.sell';
        }
    };

    actionButtonIntent = () => {
        if (this.props.selectedOrder.side === OrderSide.ASK) {
            return Intent.SUCCESS;
        } else {
            return Intent.DANGER;
        }
    };

    handleAmountChange = (amount: Amount) => this.props.dispatch(updateFormField(this.props.selectedOrder.side, 'amount', amount));

    handleSubmitOrder = () => {
    }
}

const mapStateToProps = (store) => ({
    config: store.global.siteConfig,
    selectedMarket: store.global.selectedMarket,
    baseTokenBalance: getBaseTokenBalance(store),
    quoteTokenBalance: getQuoteTokenBalance(store),
    baseTokenEnableStatus: getBaseTokenEnableStatus(store),
    quoteTokenEnableStatus: getQuoteTokenEnableStatus(store),
    walletAddr: store.wallet.walletAddr,
    formData: store.ui.tradeOrderPanel.formData,
    selectedOrder: store.ui.orderbookWidget.selectedOrder,

});

export default connect(mapStateToProps)(TradeOrderPanel);
