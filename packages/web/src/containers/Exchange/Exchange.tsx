import React from 'react';
import {connect} from 'react-redux';
import Balance from '../../components/Balance/Balance';
import {GridLayout} from '../../components/GridLayout/GridLayout';
import MarketWidget from '../../components/MarketWidget/MarketWidget';
import MyTradeWidget from '../../components/MyTradeWidget/MyTradeWidget';
import OrderBook from '../../components/OrderBook/OrderBook';
import RecentTradeWidget from '../../components/RecentTradeWidget/RecentTradeWidget';
import TradeChartWidget from '../../components/TradeChartWidget/TradeChartWidget';
import TradeWidget from '../../components/TradeWidget/TradeWidget';

interface ExchangeProps {
    exchangeInited: boolean;
}

export class Exchange extends React.PureComponent<ExchangeProps, {}> {
    render() {
        const {exchangeInited} = this.props;
        return exchangeInited ? <GridLayout>
                <div key={1}><MarketWidget/></div>
                {/*<div key={2}><TradeChartWidget/></div>*/}
                <div key={3}><OrderBook/></div>
                <div key={4}><TradeWidget/></div>
                <div key={5}><MyTradeWidget/></div>
                <div key={6}><RecentTradeWidget/></div>
                <div key={7}><Balance/></div>
            </GridLayout>: <div>loading...</div>
        ;
    }
}

const mapStateToProps = store => ({
    exchangeInited: store.global.exchangeInited
});

export default connect(mapStateToProps)(Exchange);
