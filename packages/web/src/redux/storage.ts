import {EthereumActionType} from './actions/ethereum.action';
import {GlobalActionType} from './actions/global.action';

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
];

export const filterBlackList = [
    ['global', 'dex'],
    'routing'
];

export const filterWhiteList = [
    ['global', 'tokens'],
    ['global', 'instruments'],
    ['global', 'selectedInstrument']
];
