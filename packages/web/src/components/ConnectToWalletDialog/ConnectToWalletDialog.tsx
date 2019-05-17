import {Dialog} from '@blueprintjs/core';
import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {closeDialog} from '../../redux/actions/ui/connect_to_wallet_dialog.action';
// import './style.scss';

interface ConnectToWalletDialogProps {
    dispatch: Dispatch;
    isOpen: boolean;
}

class ConnectToWalletDialog extends React.PureComponent<ConnectToWalletDialogProps, {}> {

    render() {
        return <Dialog className="connect-to-wallet" isOpen={this.props.isOpen} onClose={this.handleDialogClose}>
            please unlock Metamask
        </Dialog>;
    }

    handleDialogClose = () => {
        this.props.dispatch(closeDialog());
    }
}

const mapStateToProps = store => ({
    isOpen: store.ui.connectToWalletDialog.isOpen
});

export default connect(mapStateToProps)(ConnectToWalletDialog);
