import {Market} from '@nexex/types/orderbook';
import {createAction} from 'redux-actions';
import {SiteConfig} from '../../types';

export enum GlobalActionType {
    APP_INIT = 'global/APP_INIT',
    APP_INIT_FAIL = 'global/APP_INIT_FAIL',
    APP_INIT_COMPLETE = 'global/APP_INIT_COMPLETE',
    DEX_PROVIDER_SET = 'global/DEX_PROVIDER_SET',
    // OB_MARKETS_LOADED = 'global/INSTRUMENTS_READY',
    // INSTRUMENTS_INIT = 'global/INSTRUMENTS_INIT',
    MARKET_SELECTED = 'global/MARKET_SELECTED',
    // TOKEN_META_UPDATE = 'global/TOKEN_META_UPDATE',
    OB_MARKETS_INIT = 'global/OB_MARKETS_INIT',
    EXCHANGE_INIT_COMPLETE = 'global/EXCHANGE_INIT_COMPLETE'
}

export const initApp = createAction(
    GlobalActionType.APP_INIT,
    (config: SiteConfig) => config
);
export type AppInitAction = ReturnType<typeof initApp>;

export const initAppFail = createAction(GlobalActionType.APP_INIT_FAIL);

export const appInitComplete = createAction(GlobalActionType.APP_INIT_COMPLETE);

// export const setDexProvider = createAction(
//     GlobalActionType.DEX_PROVIDER_SET,
//     (provider: Provider) => provider
// );
// export type SetDexProviderAction = ReturnType<typeof setDexProvider>;

// export const loadedObMarkets = createAction(
//     GlobalActionType.OB_MARKETS_LOADED
// );

export const initObMarkets = createAction(
    GlobalActionType.OB_MARKETS_INIT,
    (markets: Market[]) => markets
);

export type InitObMarketsAction = ReturnType<typeof initObMarkets>;

// export const updateTokenMeta = createAction(
//     GlobalActionType.TOKEN_META_UPDATE,
//     (tokens: TokenMetaData[]) => tokens
// );
// export type UpdateTokenMetaAction = ReturnType<typeof updateTokenMeta>;

// export const initInstruments = createAction(
//     GlobalActionType.INSTRUMENTS_INIT,
//     (instruments: Instrument[]) => instruments
// );
// export type InitInstrumentsAction = ReturnType<typeof initInstruments>;

export const selectMarket = createAction(
    GlobalActionType.MARKET_SELECTED,
    (market: Market) => market
);
export type MarketSelectedAction = ReturnType<typeof selectMarket>;

export const initExchangeComplete = createAction(
    GlobalActionType.EXCHANGE_INIT_COMPLETE
);
