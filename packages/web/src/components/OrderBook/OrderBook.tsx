import {Market} from '@nexex/orderbook-client';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
import {selectOrder} from '../../redux/actions/ui/orderbook_widget.action';
import {getAsks, getBids, getSpread} from '../../redux/selectors/ui/orderbook.selector';
import {FtOrder} from '../../types';
import './style.scss';
import {Amount} from '../../utils/Amount';

interface OrderBookProps {
    dispatch: Dispatch;
    selectedMarket: Market;
    bids: FtOrder[];
    asks: FtOrder[];
    spread: BigNumber;
}

export class OrderBook extends React.PureComponent<OrderBookProps, {}> {
    static defaultProps = {
        spread: new BigNumber(0)
    };

    render() {
        return <Widget title={<Translate id="order_book_widget.title"/>}>
            <div className="orderbook-widget">
                <div className="orderbook-header">
                    {/*<div className="orderbook-header-size"><Translate id="order_book_widget.header.size"/></div>*/}
                    <div className="orderbook-header-price"><Translate id="order_book_widget.header.price"/></div>
                    <div className="orderbook-header-amount"><Translate id="order_book_widget.header.amount"/></div>
                    {/*<div className="orderbook-header-depth"><Translate id="order_book_widget.header.depth"/></div>*/}
                </div>
                <div className="orderbook-container">
                    <div className="orderbook">
                        <div className="orderbook-asks">
                            {this.props.asks.map(order =>
                                <div className="orderbook-row" key={order.orderHash}
                                     onClick={() => this.handleOrderSelect(order)}>
                                    {/*<div className="orderbook-item orderbook-item-size"></div>*/}
                                    <div className="orderbook-item orderbook-item-price">{order.price.toPrecision(8)}</div>
                                    <div className="orderbook-item orderbook-item-amount">{amountFormatter(order.remainingBaseTokenAmount)}</div>
                                </div>
                            )}
                        </div>
                        <div className="orderbook-spread">
                            <div className="orderbook-header-spread"><Translate id="order_book_widget.header.spread"/>
                            </div>
                            <div className="orderbook-header-spread-value">{this.props.spread.toPrecision(15)}</div>
                        </div>
                        <div className="orderbook-bids">

                            {this.props.bids.map(order =>
                                <div className="orderbook-row" key={order.orderHash}
                                     onClick={() => this.handleOrderSelect(order)}>
                                    {/*<div className="orderbook-item orderbook-item-size"></div>*/}
                                    <div className="orderbook-item orderbook-item-price">{order.price.toPrecision(8)}</div>
                                    <div className="orderbook-item orderbook-item-amount">{amountFormatter(order.remainingBaseTokenAmount)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Widget>;
    }

    handleOrderSelect = (order) => {
        this.props.dispatch(selectOrder(order));
    }
}

function amountFormatter(amount?: Amount): string {
    if (amount){
        return amount.toEther().toPrecision(8);
    }else {
        return '';
    }
}

const mapStateToProps = store => ({
    selectedMarket: store.global.selectedMarket,
    bids: getBids(store),
    asks: getAsks(store),
    spread: getSpread(store)
});

export default connect(mapStateToProps)(OrderBook);
