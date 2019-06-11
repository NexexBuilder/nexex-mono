import {Button, HTMLTable} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {Market} from '@nexex/types/orderbook';
import distanceInOwrdsToNow from 'date-fns/distance_in_words_to_now';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {cancelOrder} from '../../redux/actions/exchange.action';
import {getMyOrder} from '../../redux/selectors/orderbook.selector';
import {FtOrder} from '../../types';

interface MyOrderPanelProps {
    dispatch: Dispatch;
    selectedMarket: Market;
    orders: FtOrder[];
}

export class MyOrderPanel extends React.PureComponent<MyOrderPanelProps, {}> {
    static defaultProps = {
        orders: []
    };

    render() {
        return <div className="MyOrderPanel">
            <HTMLTable condensed >
                <thead>
                <tr>
                    <th className="col1"><Translate id="my_order_panel.side"/></th>
                    <th className="col2">{this.props.selectedMarket.base.symbol}</th>
                    <th className="col3">{this.props.selectedMarket.quote.symbol}</th>
                    <th className="col4"><Translate id="my_order_panel.expire"/></th>
                    <th className="col5"><Translate id="my_order_panel.state"/></th>
                    <th className="col6"></th>
                </tr>
                </thead>
                <tbody>
                    {this.props.orders.map(order =>
                        <tr key={order.orderHash} className={order.side.toLowerCase()}>
                            <td><Translate id={`exchange_terms.order_side.${order.side}`} /></td>
                            <td>{order.remainingBaseTokenAmount.toString()}/{order.baseTokenAmount.toString()}</td>
                            <td>{order.remainingQuoteTokenAmount.toString()}/{order.quoteTokenAmount.toString()}</td>
                            <td>{distanceInOwrdsToNow(new Date(order.signedOrder.expirationUnixTimestampSec * 1000))}</td>
                            <td>{order.state}</td>
                            <td><Button icon={IconNames.CROSS} minimal onClick={()=>this.handleOrderCancel(order)}></Button></td>
                        </tr>)
                    }
                </tbody>
            </HTMLTable>
        </div>;
    }

    handleOrderCancel = (order: FtOrder) => {
        this.props.dispatch(cancelOrder(order.signedOrder));
    }
}

const mapStateToProps = store => ({
    selectedMarket: store.global.selectedMarket,
    orders: getMyOrder(store)
});

export default connect(mapStateToProps)(MyOrderPanel);
