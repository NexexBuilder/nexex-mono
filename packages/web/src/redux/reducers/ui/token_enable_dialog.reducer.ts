import {ERC20Token} from '@nexex/types';
import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {
    ShowDialogAction,
    TokenEnableDialogActionType
} from '../../actions/ui/token_enable_dialog.action';

interface TokenEnableDialogState {
    isOpen: boolean;
    tokens: Array<ERC20Token>;
}

const defaultState: TokenEnableDialogState = {
    isOpen: false,
    tokens: []
};

export default handleActions<TokenEnableDialogState, any>(
    {
        [TokenEnableDialogActionType.DIALOG_SHOW]: (
            state,
            action: ShowDialogAction
        ) => update(state, {$merge: {isOpen: true, tokens: action.payload}}),
        [TokenEnableDialogActionType.DIALOG_CLOSE]: state =>
            update(state, {$set: defaultState})
    },
    defaultState
);
