import {LOCATION_CHANGE, push} from 'connected-react-router';
import {AnyAction} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {combineLatest, from, fromEvent, merge, Observable, of, OperatorFunction} from 'rxjs';
import {filter, first, mergeMap, skipUntil, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {EpicDependencies} from '../../types';
import {EthereumActionType, updateBlockNumber} from '../actions/ethereum.action';
import {GlobalActionType, initExchangeComplete, initObMarkets, selectMarket} from '../actions/global.action';
import {GlobalState} from '../reducers/global.reducer';

export const blocknumberEpic = (
    action$: Observable<AnyAction>,
    state$,
    {dexPromise}: EpicDependencies
    ) =>
        combineLatest([
            from(dexPromise), action$.pipe(ofType<AnyAction>(GlobalActionType.EXCHANGE_INIT_COMPLETE))
        ]).pipe(
            switchMap(([dex, action]) => fromEvent({
                on: dex.eth.on.bind(dex.eth), off: () => {
                }
            }, 'block').pipe(
                switchMap((block: any) => of(updateBlockNumber(block)))
            ))
        )
;

export const initObServiceConfigEpic = (
    action$: Observable<AnyAction>,
    state$,
    {obClient}: EpicDependencies
) =>
    action$.pipe(
        ofType(GlobalActionType.APP_INIT),
        mergeMap(async () => {
            const markets = await obClient.markets();
            return initObMarkets(markets);
        })
    );

// export const initTokenListEpic = (
//     action$: Observable<Action<any>>,
//     state$,
//     {dexPromise}: EpicDependencies
// ) =>
//     action$.pipe(
//         ofType(GlobalActionType.APP_INIT),
//         mergeMap(async (action: Action<any>) => {
//             const dex = await dexPromise;
//             const tokenAddresses = await dex.tokenRegistry.getTokenAddresses();
//             const tokensPromise = [];
//             for (const tokenAddr of tokenAddresses) {
//                 tokensPromise.push(
//                     dex.tokenRegistry.getTokenMetaData(tokenAddr)
//                 );
//             }
//             const tokens = await Bluebird.all(tokensPromise);
//             return updateTokenMeta(tokens);
//         })
//     );

// export const initTokenPairListEpic = (
//     action$: Observable<Action<any>>,
//     state$
// ) =>
//     action$.pipe(
//         ofType(GlobalActionType.OB_MARKETS_INIT),
//         withLatestFrom(state$),
//         mergeMap(([action, state]: [InitObMarketsAction, any]) => {
//             const finalInstrument: Instrument[] = [];
//             const markets = action.payload;
//             finalInstrument
//             for (const market of Object.keys(markets)) {
//                 const [baseSymbol, quoteSymbol] = market.split('-');
//                 const baseToken = tokens.find(
//                     meta => meta.symbol === baseSymbol
//                 );
//                 const quoteToken = tokens.find(
//                     meta => meta.symbol === quoteSymbol
//                 );
//                 if (baseToken && quoteToken) {
//                     finalInstrument.push({
//                         quote: quoteToken,
//                         base: baseToken,
//                         config: markets[market]
//                     });
//                 }
//             }
//
//             return of(initInstruments(finalInstrument), readyInstruments());
//         })
//     );

const TRADE_URL_PATTARN = /^#\/trade(\/(\w+-\w+))?/;
export const tradeUrlChangeEpic = (
    action$: Observable<AnyAction>,
    state$
) => {
    const locationChangeAction$ = action$.pipe(
        ofType(LOCATION_CHANGE),
        filter(action =>
            TRADE_URL_PATTARN.test(action.payload.location.hash)
        )
    );
    const marketsReadyAction$ = action$.pipe(
        ofType(GlobalActionType.OB_MARKETS_INIT)
    );

    const pipe: [OperatorFunction<any, any>, OperatorFunction<any, any>] = [
        withLatestFrom(state$, locationChangeAction$),
        mergeMap(([, state, action]) => {
            const match = TRADE_URL_PATTARN.exec(
                action.payload.location.hash
            );
            const [, , marketName] = match;
            const {markets} = state.global as GlobalState;
            const matchMarket = markets.find(
                market =>
                    market.marketName === marketName
            );
            if (matchMarket) {
                return of(selectMarket(matchMarket));
            } else {
                const defaultMarket = markets[0];
                return of(push(
                    `${process.env.SERVED_PATH}#/trade/${defaultMarket.marketName}`
                ) as AnyAction);
            }
        })
    ];

    return merge(
        marketsReadyAction$.pipe(
            skipUntil(locationChangeAction$),
            ...pipe
        ),
        locationChangeAction$.pipe(
            skipUntil(marketsReadyAction$),
            ...pipe
        )
    );
};

const initStatus = {
    PLUGIN_ACCESS_UPDATE: false,
    MARKET_SELECTED: false
};
const detectInitializationEpic = (
    action$: Observable<AnyAction>,
    state$: StateObservable<any>
): Observable<AnyAction> =>
    action$.pipe(
        ofType<AnyAction>(
            EthereumActionType.PLUGIN_ACCESS_UPDATE,
            GlobalActionType.MARKET_SELECTED
        ),
        tap((action: AnyAction) => {
            if (action.type === EthereumActionType.PLUGIN_ACCESS_UPDATE) {
                initStatus.PLUGIN_ACCESS_UPDATE = true;
            } else if (action.type === GlobalActionType.MARKET_SELECTED) {
                initStatus.MARKET_SELECTED = true;
            }
        }),
        filter(
            () =>
                initStatus.PLUGIN_ACCESS_UPDATE &&
                initStatus.MARKET_SELECTED
        ),
        first(),
        mergeMap((action: AnyAction) => {
            return of(initExchangeComplete());
        })
    );

export default combineEpics(
    blocknumberEpic,
    detectInitializationEpic,
    initObServiceConfigEpic,
    // initTokenPairListEpic,
    tradeUrlChangeEpic
);
