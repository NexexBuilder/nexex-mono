import {TokenMetaData} from '@nexex/types';
import {Market} from '@nexex/types/orderbook';
import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {SiteConfig} from '../../types';
import {
    AppInitAction,
    GlobalActionType, InitObMarketsAction,
    MarketSelectedAction
} from '../actions/global.action';

export interface GlobalState {
    exchangeInited: boolean;
    selectedMarket?: Market;
    siteConfig?: SiteConfig;
    tokens: TokenMetaData[];
    markets: Market[];
    marketConfig?: {
        minOrderBaseVolumn: string;
        minOrderQuoteVolumn: string;
        makerRecipient: string;
        minMakerFeeRate: string;
    };
    // currentAccount?: string;
}

const defaultState: GlobalState = {
    exchangeInited: false,
    tokens: [],
    markets: [],
};

export default handleActions<GlobalState, any>(
    {
        [GlobalActionType.APP_INIT]: (state, action: AppInitAction) =>
            update(state, {$merge: {siteConfig: action.payload}}),
        [GlobalActionType.OB_MARKETS_INIT]: (
            state,
            action: InitObMarketsAction
        ) => {
            return update(state, {
                $merge: {markets: action.payload}
            });
        },
        [GlobalActionType.MARKET_SELECTED]: (
            state,
            action: MarketSelectedAction
        ) => {
            return update(state, {
                $merge: {selectedMarket: action.payload}
            });
        },
        // [GlobalActionType.TOKEN_META_UPDATE]: (
        //     state,
        //     action: UpdateTokenMetaAction
        // ) => {
        //     return update(state, {
        //         $merge: {tokens: action.payload}
        //     });
        // },
        [GlobalActionType.EXCHANGE_INIT_COMPLETE]: state => {
            return update(state, {
                $merge: {exchangeInited: true}
            });
        },
        [GlobalActionType.OB_MARKETS_INIT]: (state, action: InitObMarketsAction) => {
            return update(state, {
                markets: {$set: action.payload}
            });
        }
    },
    defaultState
);
