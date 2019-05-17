import {Menu, Popover, Position} from '@blueprintjs/core';
import {Market} from '@nexex/orderbook-client';
import * as React from 'react';
import {pure} from 'recompose';
import './style.scss';

export interface InstrumentSelectorProps extends InstrumentMenuProps {
    onMenuClick(instrument: Market): void;
}

interface InstrumentMenuProps {
    selectedMarket: Market;
    markets: Market[];
}

class MarketSelectorCls extends React.PureComponent<InstrumentSelectorProps, {}> {

    public render() {
        const {selectedMarket, markets} = this.props;
        const {quote, base} = selectedMarket;

        return (
            <Popover className="instrument-selector" minimal position={Position.BOTTOM}
                     content={<this.InstrumentMenu selectedMarket={selectedMarket} markets={markets}/>}>
                <div className="bp3-button bp3-minimal">{base.symbol}/{quote.symbol}</div>
            </Popover>
        );
    }

    InstrumentMenu = pure<InstrumentMenuProps>((props) => <Menu>
        {
            props.markets.map(market => {
                const {quote, base} = market;
                const key = base.symbol + quote.symbol;
                return <Menu.Item key={key} text={`${base.symbol}/${quote.symbol}`}
                                  onClick={() => {
                                      if (!compareInstruments(props.selectedMarket, market)) {
                                          this.props.onMenuClick(market);
                                      }
                                  }}/>;
            })
        }

    </Menu>);
}

function compareInstruments(left: Market, right: Market) {
    if (left === undefined && right !== undefined) {
        return false;
    }
    if (left !== undefined && right === undefined) {
        return false;
    }
    return (left.base.symbol === right.base.symbol && left.quote.symbol === right.quote.symbol);
}

export const MarketSelector = MarketSelectorCls;
