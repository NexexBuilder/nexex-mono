import {Button, Intent} from '@blueprintjs/core';
import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {updateFormAmount} from '../../redux/actions/ui/eth_unwrap_dialog.action';
import {unwrapETH} from '../../redux/actions/wallet.action';
import AmountInput from '../../ui-components/AmountInput/AmountInput';
import {Amount} from '../../utils/Amount';
import './style.scss';

interface ETHUnWrapViewProps {
    dispatch: Dispatch;
    ethBalance: Amount;
    baseTokenBalance: Amount;
    walletAddr: string;
    formAmount: Amount;
}

export class ETHUnwrapView extends React.PureComponent<ETHUnWrapViewProps, {}> {
    UnWrapEthBtn = (props) => <Button large fill intent={Intent.PRIMARY} onClick={this.handleUnwrapETH}>UNWRAP
        ETH</Button>;

    render() {
        const ethBalanceDisplay = this.props.ethBalance && this.props.ethBalance.toString();
        const wethBalanceDisplay = this.props.baseTokenBalance && this.props.baseTokenBalance.toString();
        return <div className="eth-wrap-view">
            <div className="balance-bar">
                ETH balance:{ethBalanceDisplay}•WETH balance:{wethBalanceDisplay}
            </div>
            <div>
                <AmountInput max={this.props.baseTokenBalance} onChange={this.handleAmountChange}
                             decimals={this.props.baseTokenBalance.decimals} slider={true}
                             rightElement={<this.UnWrapEthBtn/>}/>
            </div>
            <div>
                explains
            </div>
        </div>;
    }

    handleAmountChange = (value: Amount) => {
        this.props.dispatch(updateFormAmount(value));
    }

    handleUnwrapETH = () => {
        this.props.dispatch(unwrapETH(this.props.walletAddr, this.props.formAmount));
    }
}

const mapStateToProps = store => ({
    walletAddr: store.wallet.walletAddr,
    ethBalance: store.wallet.walletBalance.ETH,
    baseTokenBalance: store.wallet.walletBalance.WETH,
    formAmount: store.ui.ethUnwrapDialog.formAmount
});

export default connect(mapStateToProps)(ETHUnwrapView);
