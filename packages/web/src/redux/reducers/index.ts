import {routerReducer} from 'react-router-redux';
import {combineReducers} from 'redux';

import ethereumReducer from './ethereum.reducer';
import globalReducer from './global.reducer';
import orderbookReducer from './orderbook.reducer';
import walletReducer from './wallet.reducer';
import uiReducer from './ui';

const reducers = {
    routing: routerReducer,
    global: globalReducer,
    wallet: walletReducer,
    ethereum: ethereumReducer,
    orderbook: orderbookReducer,
    ui: uiReducer
};

export default combineReducers(reducers);
