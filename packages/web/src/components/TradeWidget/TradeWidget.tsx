import {Tab, Tabs} from '@blueprintjs/core';
import {OrderSide, TokenMetaData} from '@nexex/types';
import {Market} from '@nexex/types/orderbook';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
import {FtOrder} from '../../types';
import {Amount} from '../../utils/Amount';
import NewOrderPannel from './NewOrderPanel';
import TradeOrderPanel from './TradeOrderPanel';

interface TradeWidgetProps {
    dispatch: Dispatch;
    selectedMarket: Market;
    tokens: TokenMetaData[];
    walletBalance: {[symbol: string]: Amount};
    selectedOrder?: FtOrder;
}

export class TradeWidget extends React.PureComponent<TradeWidgetProps, {}> {
    static defaultProps = {
        // isOpen: false
    };

    render() {

        return this.props.selectedOrder ? <TradeOrderPanel/> :
            <Widget title={<Translate id="trade_widget.title"/>}>
                <Tabs id="TradeWidgetTab" defaultSelectedTabId="buy">
                    <Tab id="buy" title="Buy" panel={<NewOrderPannel side={OrderSide.BID}/>}/>
                    <Tab id="sell" title="Sell" panel={<NewOrderPannel side={OrderSide.ASK}/>}/>
                </Tabs>
            </Widget>;
    }
}

const mapStateToProps = store => ({
    selectedMarket: store.global.selectedMarket,
    walletBalance: store.wallet.walletBalance,
    tokens: store.global.tokens,
    selectedOrder: store.ui.orderbookWidget.selectedOrder
});

export default connect(mapStateToProps)(TradeWidget);
