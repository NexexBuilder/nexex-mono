import {Dialog} from '@blueprintjs/core';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {Dispatch} from 'redux';
import {closeDialog} from '../../redux/actions/ui/eth_wrap_dialog.action';
import ETHWrapView from './ETHWrapView';
import './style.scss';

interface ETHWrapDialogProps {
    dispatch: Dispatch;
    isOpen: boolean;
    currentStep: number;
    stepView: Component;
}

const showCurrentStep = (mapStepToComp) => (Component) => (props) =>
    <Component {...props} stepView={mapStepToComp(props)}/>;

export class ETHWrapDialog extends React.PureComponent<ETHWrapDialogProps, {}> {

    render() {
        return <Dialog className="eth-wrap-dialog" isOpen={this.props.isOpen} onClose={this.handleWrapEthDialogClose}>
            {/*<Steps current={this.props.currentStep}>*/}
                {/*<Steps.Step title={<Translate id="wrap_eth_dialog.steps.wrap"/>}/>*/}
                {/*/!*<Steps.Step title={<Translate id="wrap_eth_dialog.steps.enable"/>}/>*!/*/}
                {/*/!*<Steps.Step title={<Translate id="wrap_eth_dialog.steps.verify"/>}/>*!/*/}
            {/*</Steps>*/}
            {this.props.stepView}
        </Dialog>;
    }

    handleWrapEthDialogClose = () => {
        this.props.dispatch(closeDialog());
    }
}

const mapStateToProps = store => ({
    isOpen: store.ui.ethWrapDialog.isOpen,
    currentStep: store.ui.ethWrapDialog.currentStep,
});

const mapStepToComp = (props) => ({
    0: <ETHWrapView />
})[props.currentStep];

export default compose(
    connect(mapStateToProps),
    showCurrentStep(mapStepToComp)
)(ETHWrapDialog);
