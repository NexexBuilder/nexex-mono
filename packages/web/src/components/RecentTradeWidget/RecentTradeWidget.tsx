import {HTMLTable, Icon} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {Market} from '@nexex/types/orderbook';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
import {AmountUnit} from '../../constants';
import {getSelectedMarket} from '../../redux/selectors';
import {getLogFillEvents} from '../../redux/selectors/exchange.selector';
import {LogFillEvent} from '../../types';
import {Amount} from '../../utils/Amount';
import {etherscanTxLink} from '../../utils/etherscanUtil';
import './style.scss';

interface RecentTradeWidgetProps {
    dispatch: Dispatch;
    network: string;
    selectedMarket: Market;
    logFillEvents: LogFillEvent[]
}

export class RecentTradeWidget extends React.PureComponent<RecentTradeWidgetProps, {}> {
    static defaultProps = {};

    render() {
        const {selectedMarket, network} = this.props;
        return <Widget title={<Translate id="recent_trade_widget.title"/>} className="RecentTradeWidget">
            <HTMLTable>
                <thead>
                <tr>
                    <th><Translate id="recent_trade_widget.price"/></th>
                    <th>{selectedMarket.base.symbol}</th>
                    <th>{selectedMarket.quote.symbol}</th>
                    <th><Translate id="recent_trade_widget.view"/></th>
                </tr>
                </thead>
                <tbody>
                {this.props.logFillEvents.map(evt => {
                    const filledBaseTokenAmount = new Amount(evt.filledBaseTokenAmount, AmountUnit.WEI, selectedMarket.base.decimals);
                    const filledQuoteTokenAmount = new Amount(evt.filledQuoteTokenAmount, AmountUnit.WEI, selectedMarket.quote.decimals);
                        return (<tr key={evt.id}>
                            <td className={evt.side.toLowerCase()}>{filledQuoteTokenAmount.toEther().div(filledBaseTokenAmount.toEther())
                                .decimalPlaces(5).toString(10)}</td>
                            <td>{filledBaseTokenAmount.toString()}</td>
                            <td>{filledQuoteTokenAmount.toString()}</td>
                            <td><a href={etherscanTxLink(network, evt.id.split('-')[0])} target="_blank"><Icon
                                icon={IconNames.SHARE}/></a></td>
                        </tr>)
                    }
                )}
                </tbody>
            </HTMLTable>

        </Widget>;
    }
}

const mapStateToProps = store => ({
    network: store.global.siteConfig.dexConfig.network,
    selectedMarket: getSelectedMarket(store),
    logFillEvents: getLogFillEvents(store)
});

export default connect(mapStateToProps)(RecentTradeWidget);
