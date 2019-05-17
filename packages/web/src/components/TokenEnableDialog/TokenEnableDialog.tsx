import {Dialog} from '@blueprintjs/core';
import {ERC20Token} from '@nexex/types';
import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {closeDialog} from '../../redux/actions/ui/token_enable_dialog.action';

// import './style.scss';

interface TokenEnableDialogProps {
    dispatch: Dispatch;
    isOpen: boolean;
    tokens: Array<ERC20Token>;
}

class TokenEnableDialog extends React.PureComponent<TokenEnableDialogProps, {}> {

    render() {
        return <Dialog className="token-enable-dialog" title={<Translate id="token_enable_dialog.title"/>}
                       isOpen={this.props.isOpen} onClose={this.handleDialogClose}>
            empty
        </Dialog>;
    }

    handleDialogClose = () => {
        this.props.dispatch(closeDialog());
    }
}

const mapStateToProps = store => ({
    isOpen: store.ui.tokenEnableDialog.isOpen,
    tokens: store.ui.tokenEnableDialog.tokens,
    allowances: store.wallet.tokenAllowances,
});

export default connect(mapStateToProps)(TokenEnableDialog);
