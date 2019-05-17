import {Dialog} from '@blueprintjs/core';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {closeDialog} from '../../redux/actions/ui/eth_unwrap_dialog.action';
import ETHUnwrapView from './ETHUnwrapView';
import './style.scss';

interface ETHUnrapDialogProps {
    dispatch: Dispatch;
    isOpen: boolean;
}

export class ETHUnwrapDialog extends React.PureComponent<ETHUnrapDialogProps, {}> {

    render() {
        return <Dialog className="eth-unwrap-dialog" isOpen={this.props.isOpen} onClose={this.handleWrapEthDialogClose}>
            <ETHUnwrapView/>
        </Dialog>;
    }

    handleWrapEthDialogClose = () => {
        this.props.dispatch(closeDialog());
    }
}

const mapStateToProps = store => ({
    isOpen: store.ui.ethUnwrapDialog.isOpen,
});

export default connect(mapStateToProps)(ETHUnwrapDialog);
