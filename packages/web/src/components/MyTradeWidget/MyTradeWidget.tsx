import { Tab, Tabs } from "@blueprintjs/core";
import React from 'react';
import {Translate} from 'react-localize-redux';
import {Widget} from '../../components/Widget/Widget';
import MyOrderPanel from './MyOrderPanel';
import {MyTradePanel} from './MyTradePanel';
import './style.scss';

interface MyTradeWidgetState {
    selectedTab: string;
}

export class MyTradeWidget extends React.PureComponent<{}, MyTradeWidgetState> {
    state = {
        selectedTab: 'myOrder'
    };

    render() {
        return <Widget title={<Translate id="my_trade_widget.title"/>} hideTitle={true}>
            <Tabs id="TabsExample" onChange={this.handleTabChange} selectedTabId={this.state.selectedTab}>
                <Tab id="myOrder" title={<Translate id="my_trade_widget.tab.my_order"/>} panel={<MyOrderPanel />} />
                <Tab id="myTrade" title={<Translate id="my_trade_widget.tab.my_trade"/>} panel={<MyTradePanel />} />
            </Tabs>
        </Widget>;
    }

    handleTabChange = (newTabId) => {
        this.setState({selectedTab: newTabId});
    }
}

export default MyTradeWidget;
