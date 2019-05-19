import {combineEpics, Epic} from 'redux-observable';
import ethereumEpics from './ethereum.epic';
import exchangeEpics from './exchange.epic';
import globalEpics from './global.epic';
import orderbookEpics from './orderbook.epic';
import uiEpics from './ui';
import walletEpics from './wallet.epic';

const rootEpic: Epic = combineEpics(
    uiEpics,
    globalEpics,
    ethereumEpics,
    exchangeEpics,
    orderbookEpics,
    walletEpics
);

export default rootEpic;
