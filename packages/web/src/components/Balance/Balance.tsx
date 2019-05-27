import {Button, HTMLTable, Intent, Switch} from '@blueprintjs/core';
import {TokenMetaData} from '@nexex/types';
import {Market} from '@nexex/types/orderbook';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
import {PLUGIN_ACCESS} from '../../constants';
import * as ConnectToWalletDialogAction from '../../redux/actions/ui/connect_to_wallet_dialog.action';
import * as EthUnwrapDialogAction from '../../redux/actions/ui/eth_unwrap_dialog.action';
import * as EthWrapDialogAction from '../../redux/actions/ui/eth_wrap_dialog.action';
import {approveToken, revokeApproveToken} from '../../redux/actions/wallet.action';
import {
    getBaseTokenBalance,
    getBaseTokenEnableStatus,
    getETHBalance,
    getQuoteTokenBalance,
    getQuoteTokenEnableStatus
} from '../../redux/selectors';
import {baseTokenSpin, quoteTokenSpin} from '../../redux/selectors/ui/balance.selector';
import {Spin} from '../../ui-components/Spin/Spin';
import {Amount} from '../../utils/Amount';
import ETHUnwrapDialog from '../ETHUnwrapDialog/ETHUnwrapDialog';
import ETHWrapDialog from '../ETHWrapDialog/ETHWrapDialog';
import './style.scss';

interface BalanceProps {
    dispatch: Dispatch;
    selectedMarket: Market;
    tokens: TokenMetaData[];
    isWalletConnected: boolean;
    walletAddr: string;
    baseTokenBalance: Amount;
    quoteTokenBalance: Amount;
    ethBalance: Amount;
    baseTokenEnableStatus: boolean | null;
    quoteTokenEnableStatus: boolean | null;
    baseTokenSpin: boolean;
    quoteTokenSpin: boolean;
}

export class Balance extends React.PureComponent<BalanceProps, {}> {
    static defaultProps = {
        // isOpen: false
    };

    render() {
        const {
            selectedMarket, baseTokenBalance = '', quoteTokenBalance = '', ethBalance = '',
            baseTokenEnableStatus, quoteTokenEnableStatus
        } = this.props;

        return <Widget title={<Translate id="balance_widget.title"/>} className="balance-widget">
            <HTMLTable small>
                <thead>
                <tr>
                    <th className="col1"><Translate id="balance_widget.headers.symbol"/></th>
                    <th><Translate id="balance_widget.headers.balance"/></th>
                    {/*<th><Translate id="balance_widget.headers.available"/></th>*/}
                    <th className="col3"><Translate id="balance_widget.headers.enable"/></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{selectedMarket.base.symbol}</td>
                    <td>{baseTokenBalance.toString()}</td>
                    <td><Spin spin={this.props.baseTokenSpin} size={22}><Switch checked={baseTokenEnableStatus} onChange={this.handleBaseEnableChange}/></Spin></td>
                </tr>
                <tr>
                    <td>{selectedMarket.quote.symbol}</td>
                    <td>{quoteTokenBalance.toString()}</td>
                    <td><Spin spin={this.props.quoteTokenSpin} size={22}><Switch checked={quoteTokenEnableStatus} onChange={this.handleQuoteEnableChange}/></Spin></td>
                </tr>
                <tr>
                    <td>ETH</td>
                    <td>{ethBalance.toString()}</td>
                </tr>
                </tbody>
            </HTMLTable>
            <div>
                <Button intent={Intent.SUCCESS} onClick={this.handleWrapEthButton}><Translate
                    id="balance_widget.button.wrap_eth"/></Button>
                <Button intent={Intent.DANGER} onClick={this.handleUnwrapEthButton}><Translate
                    id="balance_widget.button.unwrap_weth"/></Button>
            </div>
            <ETHWrapDialog/>
            <ETHUnwrapDialog/>
        </Widget>;
    }

    handleWrapEthButton = () => {
        if (this.props.isWalletConnected) {
            this.props.dispatch(EthWrapDialogAction.showDialog());
        } else {
            this.props.dispatch(ConnectToWalletDialogAction.showDialog());
        }
    }

    handleUnwrapEthButton = () => {
        if (this.props.isWalletConnected) {
            this.props.dispatch(EthUnwrapDialogAction.showDialog());
        } else {
            this.props.dispatch(ConnectToWalletDialogAction.showDialog());
        }
    }

    handleQuoteEnableChange = (event) => {
        if (event.target.checked) {
            this.props.dispatch(approveToken(this.props.walletAddr, this.props.selectedMarket.quote));
        } else {
            this.props.dispatch(revokeApproveToken(this.props.walletAddr, this.props.selectedMarket.quote));
        }
    }

    handleBaseEnableChange = (event) => {
        if (event.target.checked) {
            this.props.dispatch(approveToken(this.props.walletAddr, this.props.selectedMarket.base));
        } else {
            this.props.dispatch(revokeApproveToken(this.props.walletAddr, this.props.selectedMarket.base));
        }
    }
}

const mapStateToProps = store => ({
    selectedMarket: store.global.selectedMarket,
    baseTokenBalance: getBaseTokenBalance(store),
    quoteTokenBalance: getQuoteTokenBalance(store),
    ethBalance: getETHBalance(store),
    baseTokenEnableStatus: getBaseTokenEnableStatus(store),
    quoteTokenEnableStatus: getQuoteTokenEnableStatus(store),
    tokens: store.global.tokens,
    walletAddr: store.wallet.walletAddr,
    isWalletConnected: store.ethereum.pluginAccess === PLUGIN_ACCESS.FULL,
    baseTokenSpin: baseTokenSpin(store),
    quoteTokenSpin: quoteTokenSpin(store),
});

export default connect(mapStateToProps)(Balance);
