import {combineReducers} from 'redux';
import BalanceWidgetReducer from './balance_widget.reducer';
import connectToWalletDialogReducer from './connect_to_wallet_dialog.reducer';
import ethUnwrapDialogReducer from './eth_unwrap_dialog.reducer';
import ethWrapDialogReducer from './eth_wrap_dialog.reducer';
import newOrderPanelReducer from './new_order_panel.reducer';
import OrderbookWidgetReducer from './orderbook_widget.reducer';
import tokenEnableDialogReducer from './token_enable_dialog.reducer';
import tradeOrderPanelReducer from './trade_order_panel.reducer';

const reducers = {
    ethWrapDialog: ethWrapDialogReducer,
    ethUnwrapDialog: ethUnwrapDialogReducer,
    connectToWalletDialog: connectToWalletDialogReducer,
    newOrderPanel: newOrderPanelReducer,
    tradeOrderPanel: tradeOrderPanelReducer,
    tokenEnableDialog: tokenEnableDialogReducer,
    balanceWidget: BalanceWidgetReducer,
    orderbookWidget: OrderbookWidgetReducer,
};

export default combineReducers(reducers);
