import {routerReducer} from 'react-router-redux';
import {combineReducers} from 'redux';

import ethereumReducer from './ethereum.reducer';
import exchangeReducer from './exchange.reducer';
import globalReducer from './global.reducer';
import orderbookReducer from './orderbook.reducer';
import uiReducer from './ui';
import userReducer from './user.reducer';
import walletReducer from './wallet.reducer';

const reducers = {
    routing: routerReducer,
    global: globalReducer,
    wallet: walletReducer,
    ethereum: ethereumReducer,
    exchange: exchangeReducer,
    orderbook: orderbookReducer,
    ui: uiReducer,
    user: userReducer
};

export default combineReducers(reducers);
