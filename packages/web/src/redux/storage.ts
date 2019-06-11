import {EthereumActionType} from './actions/ethereum.action';
import {ExchangeActionType} from './actions/exchange.action';
import {GlobalActionType} from './actions/global.action';
import {UserActionType} from './actions/user.action';

export const actionBlackList = [
    GlobalActionType.APP_INIT_COMPLETE,
    EthereumActionType.BLOCKNUMBER_UPDATE,
    // GlobalActionType.DEX_CLIENT_INIT_SUCCESS,
    GlobalActionType.EXCHANGE_INIT_COMPLETE,
    EthereumActionType.PLUGIN_ACCESS_UPDATE
];

export const actionWhiteList = [
    // GlobalActionType.TOKEN_META_UPDATE,
    GlobalActionType.MARKET_SELECTED,
    GlobalActionType.OB_MARKETS_INIT,
    ExchangeActionType.EVENT_SYNC_FINISH,
    UserActionType.USER_ORDER_INSERT,
    UserActionType.USER_ORDER_UPDATE
];

export const filterBlackList = [
    ['global', 'dex'],
    'routing'
];

export const filterWhiteList = [
    ['global', 'markets'],
    ['global', 'selectedMarket'],
    'exchange',
    'user'
];
