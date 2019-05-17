import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {ConnectToWalletDialogActionType} from '../../actions/ui/connect_to_wallet_dialog.action';

interface ConnectToWalletDialogState {
    isOpen: boolean;
}

const defaultState: ConnectToWalletDialogState = {
    isOpen: false
};

export default handleActions<ConnectToWalletDialogState, any>(
    {
        [ConnectToWalletDialogActionType.DIALOG_SHOW]:
            (state) =>
                update(state, {$merge: {isOpen: true}})
        ,
        [ConnectToWalletDialogActionType.DIALOG_CLOSE]:
            (state) =>
                update(state, {$set: defaultState})


    }, defaultState
);
