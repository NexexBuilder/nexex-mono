import {combineEpics, Epic} from 'redux-observable';
import ethUnwrapDialogEpics from './eth_unwrap_dialog.epic';
import ethWrapDialogEpics from './eth_wrap_dialog.epic';
import tradeOrderPanelEpics from './trade_order_panel.epic';

const rootEpic: Epic = combineEpics(
    ethWrapDialogEpics,
    ethUnwrapDialogEpics,
    tradeOrderPanelEpics
);

export default rootEpic;
