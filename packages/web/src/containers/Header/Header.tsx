import {Alignment, Button, Callout, Intent, Navbar} from '@blueprintjs/core';
import {Market} from '@nexex/types/orderbook';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {CALL_HISTORY_METHOD} from 'react-router-redux';
import {Dispatch} from 'redux';
import {selectMarket} from '../../redux/actions/global.action';
import {addressToLength} from '../../utils/formatters';
import './header.scss';
import {MarketSelector} from './InstrumentSelector/MarketSelector';

export interface HeaderProps {
    currentAccount: string;
    selectedMarket: Market;
    markets: Market[];
    dispatch: Dispatch;
    isWrongNetwork: boolean;
}

class HeaderCls extends React.PureComponent<HeaderProps, {}> {

    render() {
        const {currentAccount, markets, isWrongNetwork} = this.props;
        const {selectedMarket = markets[0]} = this.props;
        return <div>
            <Navbar className="ex-header">
                <Navbar.Group align={Alignment.LEFT}>
                    <Navbar.Heading>
                        <Translate id="dex.title"/>
                    </Navbar.Heading>
                    <Navbar.Divider/>
                    <MarketSelector selectedMarket={selectedMarket} markets={markets} onMenuClick={this.handleInstrumentSelected}/>
                </Navbar.Group>
                <Navbar.Group align={Alignment.RIGHT}>
                    <ul className="header-menu">
                        <li className="account bp3-button bp3-minimal">{
                            addressToLength(currentAccount, 4, 4) || 'Not Connected'}</li>
                    </ul>
                    <Button large minimal icon="document" text="Files" fill/>
                </Navbar.Group>
            </Navbar>
            {isWrongNetwork && <Callout intent={Intent.DANGER}><Translate id="warnings.wrong_network"/></Callout>}
        </div>;
    }

    handleInstrumentSelected = (market: Market) => {
        this.props.dispatch(selectMarket(market));
        this.props.dispatch({
            type: CALL_HISTORY_METHOD, payload: {
                method: 'push',
                args: [
                    `/trade/${market.marketName}`
                ]
            }
        });
    };
}

export const Header = connect((store: any) => ({
    currentAccount: store.wallet.walletAddr,
    selectedMarket: store.global.selectedMarket,
    markets: store.global.markets,
    isWrongNetwork: store.ethereum.isWrongNetwork
}))(HeaderCls);
