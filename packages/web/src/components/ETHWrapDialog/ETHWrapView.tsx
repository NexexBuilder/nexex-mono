import {Button, Intent} from '@blueprintjs/core';
import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {updateFormAmount} from '../../redux/actions/ui/eth_wrap_dialog.action';
import {wrapETH} from '../../redux/actions/wallet.action';
import AmountInput from '../../ui-components/AmountInput/AmountInput';
import {Amount} from '../../utils/Amount';
import './style.scss';

interface ETHWrapViewProps {
    dispatch: Dispatch;
    ethBalance: Amount;
    baseTokenBalance: Amount;
    walletAddr: string;
    formAmount: Amount;
}

export class ETHWrapView extends React.PureComponent<ETHWrapViewProps, {}> {
    WrapEthBtn = (props) => <Button large fill intent={Intent.PRIMARY} onClick={this.handleWrapETH}>WRAP ETH</Button>;

    render() {
        const ethBalanceDisplay = this.props.ethBalance && this.props.ethBalance.toString();
        const wethBalanceDisplay = this.props.baseTokenBalance && this.props.baseTokenBalance.toString();
        return <div className="eth-wrap-view">
            <div className="balance-bar">
                ETH balance:{ethBalanceDisplay}•WETH balance:{wethBalanceDisplay}
            </div>
            <div>
                <AmountInput max={this.props.ethBalance} onChange={this.handleAmountChange} decimals={this.props.ethBalance.decimals}
                             rightElement={<this.WrapEthBtn />} slider={true}/>
            </div>
            <div>
                explains
            </div>
        </div>;
    }

    handleAmountChange = (value: Amount) => {
        this.props.dispatch(updateFormAmount(value));
    }

    handleWrapETH = () => {
        this.props.dispatch(wrapETH(this.props.walletAddr, this.props.formAmount));
    }
}

const mapStateToProps = store => ({
    walletAddr: store.wallet.walletAddr,
    ethBalance: store.wallet.walletBalance.ETH,
    baseTokenBalance: store.wallet.walletBalance.WETH,
    formAmount: store.ui.ethWrapDialog.formAmount,
});

export default connect(mapStateToProps)(ETHWrapView);
