import {Button, FormGroup, Intent} from '@blueprintjs/core';
import {OrderSide} from '@nexex/types';
import {Market} from '@nexex/types/orderbook';
import BigNumber from 'bignumber.js';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {fillOrder} from '../../redux/actions/exchange.action';
import {updateFormAmount} from '../../redux/actions/ui/trade_order_panel.action';
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

    // TODO: make AmountInput min of baseTokenBalance and remainingBaseTokenAmount
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
                <Button fill intent={this.actionButtonIntent()} onClick={this.handleTradeOrder}><Translate
                    id={this.actionButtonText()}/> {base.name}({base.symbol})</Button>
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

    handleAmountChange = (amount: Amount) => this.props.dispatch(updateFormAmount(amount));

    handleTradeOrder = () => {
        const {dispatch, selectedOrder, formData} = this.props;
        if (selectedOrder.side === OrderSide.ASK) {
            // buy base token
            if (formData.isDirty) {
                const takerAmount = formData.baseTokenAmount.toEther().times(selectedOrder.price)
                    .times(10 ** selectedOrder.quoteToken.decimals).decimalPlaces(0, BigNumber.ROUND_DOWN);
                dispatch(fillOrder(takerAmount.toString(10), selectedOrder.signedOrder));
            } else {
                dispatch(fillOrder(formData.baseTokenAmount.toWei().toString(10), selectedOrder.signedOrder));
            }
        } else {
            // sell base token
            dispatch(fillOrder(formData.baseTokenAmount.toWei().toString(10), selectedOrder.signedOrder));
        }
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
