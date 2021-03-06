import {orderUtil} from '@nexex/api/utils';
import {OrderSide} from '@nexex/types';
import {OrderSlim} from '@nexex/types/orderbook';
import BigNumber from 'bignumber.js';
import {utils} from 'ethers';
import * as R from 'ramda';
import {Action} from 'redux';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {combineLatest, from, of} from 'rxjs';
import {Observable} from 'rxjs/internal/Observable';
import {delay, filter, first, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {EpicDependencies, LogFillEvent} from '../../types';
import {getMetamaskSigner} from '../../utils/metamaskUtil';
import {EthereumActionType, UpdateBlockNumberAction} from '../actions/ethereum.action';
import {
    EventSyncAction,
    EventSyncFinishAction,
    ExchangeActionType,
    finishSyncEvents,
    mergeEvents,
    OrderCancelAction,
    OrderFillAction,
    OrderFillUpToAction,
    orderPublished,
    SubmitOrderAction,
    syncEvent
} from '../actions/exchange.action';
import {GlobalActionType, MarketSelectedAction} from '../actions/global.action';
import {EthereumState} from '../reducers/ethereum.reducer';
import {ExchangeState} from '../reducers/exchange.reducer';
import {GlobalState} from '../reducers/global.reducer';
import {fromTransactionEvent} from './ethereum.epic';

export const submitOrderEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise, obClient}: EpicDependencies
): Observable<Action> =>
    action$.pipe(
        ofType(ExchangeActionType.ORDER_SUBMIT),
        mergeMap(async (action: SubmitOrderAction) => {
            const order = action.payload;
            const dex = await dexPromise;
            order.exchangeContractAddress = await dex.exchange.getContractAddress();
            const signed = await dex.signOrder(getMetamaskSigner(), order);
            const orderHash = orderUtil.getOrderHashHex(signed);
            await obClient.placeOrder(orderHash, signed);
            return orderPublished(signed);
        })
    );

export const fillOrderEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        dexPromise, action$.pipe(
            ofType<OrderFillAction>(ExchangeActionType.ORDER_FILL)
        )])
        .pipe(
            withLatestFrom(state$),
            mergeMap(([[dex, action], state]) => {
                const {order, takerAmount} = action.payload;
                const tx = dex.exchange.fillOrder(getMetamaskSigner(), order, takerAmount, state.global.siteConfig.takerFeeRecipient, false);

                return fromTransactionEvent(tx, 'ETH_ORDER_FILL', state.wallet.walletAddr, action.payload);
            })
        );

export const fillOrderUpToEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise, obClient}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        dexPromise, action$.pipe(
            ofType<OrderFillUpToAction>(ExchangeActionType.ORDER_FILL_UP_TO),
            switchMap(({payload}) => {
                const {takerAmount, order} = payload;
                let acc = new BigNumber(0);
                const orderHashs: string[] = R.compose(
                    R.map(order => order.orderHash),
                    R.takeWhile<OrderSlim>(slim => {
                        if (acc.lt(takerAmount)) {
                            if(order.side === OrderSide.BID){
                                acc = acc.plus(slim.remainingBaseTokenAmount);
                            }else{
                                acc = acc.plus(slim.remainingQuoteTokenAmount);
                            }
                            return true;
                        } else {
                            return false;
                        }
                    }),
                    R.sortWith<OrderSlim>([(left, right) => left.remainingBaseTokenAmount.minus(right.remainingBaseTokenAmount).toNumber()])
                )(order.orders);
                return from(
                    obClient.queryOrderBatch(`${order.baseToken.addr}-${order.quoteToken.addr}`, order.side, orderHashs)
                ).pipe(withLatestFrom(of(payload)));
            }),
        )])
        .pipe(
            withLatestFrom(state$),
            mergeMap(([[dex, [orders, payload]], state]) => {
                const tx = dex.exchange.fillOrdersUpTo(getMetamaskSigner(), orders, payload.takerAmount, state.global.siteConfig.takerFeeRecipient, false)

                return fromTransactionEvent(tx, 'ETH_ORDER_FILL_UP_TO', state.wallet.walletAddr, payload);
            })
        );

export const cancelOrderEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        dexPromise, action$.pipe(
            ofType<OrderCancelAction>(ExchangeActionType.ORDER_CANCEL)
        )])
        .pipe(
            withLatestFrom(state$),
            mergeMap(([[dex, action], state]) => {
                const signedOrder = action.payload;
                const tx = dex.exchange.cancelOrder(getMetamaskSigner(), signedOrder);

                return fromTransactionEvent(tx, 'ETH_ORDER_CANCEL', state.wallet.walletAddr, {order: signedOrder});
            })
        );

export const requestSyncEventsEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        dexPromise, action$.pipe(
            ofType<MarketSelectedAction>(GlobalActionType.MARKET_SELECTED)
        )])
        .pipe(
            withLatestFrom(state$),
            mergeMap(([[dex, action], state]) => {
                const {selectedMarket, siteConfig} = state.global as GlobalState;
                const {blockNumber} = state.ethereum as EthereumState;
                if (!blockNumber || blockNumber <= 0) {
                    return action$.pipe(
                        ofType<UpdateBlockNumberAction>(EthereumActionType.BLOCKNUMBER_UPDATE),
                        first(),
                        map(action => {
                            const blockNumber = action.payload;
                            const {events} = state.exchange as ExchangeState;
                            const marketEvents = events[selectedMarket.marketId] || {} as any;
                            return syncEvent({
                                market: selectedMarket, startBlock: blockNumber,
                                endBlock: marketEvents.lastBlock ? (marketEvents.lastBlock + 1) : (blockNumber - siteConfig.backTrackBlocks),
                                currentBlock: blockNumber, batch: siteConfig.syncBatchBlocks
                            });
                        })
                    )
                } else {
                    const {events} = state.exchange as ExchangeState;
                    const marketEvents = events[selectedMarket.marketId] || {} as any;
                    return of(syncEvent({
                        market: selectedMarket, startBlock: blockNumber,
                        endBlock: marketEvents.lastBlock ? (marketEvents.lastBlock + 1) : (blockNumber - siteConfig.backTrackBlocks),
                        currentBlock: blockNumber, batch: siteConfig.syncBatchBlocks
                    }));

                }
            })
        );

export const syncEventsEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>,
    {dexPromise}: EpicDependencies
): Observable<Action> =>
    combineLatest([
        dexPromise, action$.pipe(
            ofType<EventSyncAction>(ExchangeActionType.EVENT_SYNC)
        )])
        .pipe(
            withLatestFrom(state$),
            filter(([[, action], state]) => state.global.selectedMarket.marketId === action.payload.market.marketId),
            mergeMap(([[dex, action], state]) => {
                    const {selectedMarket: {base, quote}} = state.global as GlobalState;

                    const {payload: {currentBlock: toBlock, batch, endBlock, market, startBlock}} = action;
                    const fromBlock = Math.max(toBlock - batch, endBlock);
                    const address = dex.exchange.getContractAddress();
                    const marketTopics = [
                        utils.keccak256(utils.concat([base.addr, quote.addr])),
                        utils.keccak256(utils.concat([quote.addr, base.addr]))];
                    const topics = [dex.exchange.contract.interface.events.LogFill.topic, , marketTopics];
                    return from(dex.eth.getLogs({fromBlock, toBlock, address, topics})).pipe(
                        first(),
                        mergeMap(logs => {
                            const outputActions: Action[] = [];
                            const events: LogFillEvent[] = [];
                            for (const log of logs) {
                                const decoded = dex.exchange.contract.interface.events.LogFill.decode(log.data);
                                const {taker, makerToken, takerToken, filledMakerTokenAmount, filledTakerTokenAmount, orderHash} = decoded;
                                let filledBaseTokenAmount, filledQuoteTokenAmount, side;
                                if (makerToken.toLowerCase() === base.addr.toLowerCase()) {
                                    filledBaseTokenAmount = filledMakerTokenAmount.toString();
                                    filledQuoteTokenAmount = filledTakerTokenAmount.toString();
                                    side = OrderSide.BID;
                                } else {
                                    filledBaseTokenAmount = filledTakerTokenAmount.toString();
                                    filledQuoteTokenAmount = filledMakerTokenAmount.toString();
                                    side = OrderSide.ASK;
                                }
                                events.push({
                                    id: `${log.transactionHash}-${log.logIndex}`,
                                    blockNumber: log.blockNumber,
                                    maker: utils.hexDataSlice(log.topics[1], 12),
                                    taker,
                                    side,
                                    filledBaseTokenAmount,
                                    filledQuoteTokenAmount,
                                    orderHash
                                } as LogFillEvent)
                            }
                            if (events.length > 0) {
                                outputActions.push(mergeEvents(market.marketId, events));
                            }
                            if (fromBlock > endBlock) {
                                outputActions.push(syncEvent({
                                    ...action.payload, currentBlock: fromBlock - 1
                                }));
                            } else {
                                outputActions.push(finishSyncEvents(market.marketId, startBlock));
                            }
                            return from(outputActions);
                        })
                    );
                }
            )
        );

export const startNewRoundSyncEpic = (
    action$: Observable<Action>,
    state$: StateObservable<any>
): Observable<Action> =>
    action$.pipe(
        ofType<EventSyncFinishAction>(ExchangeActionType.EVENT_SYNC_FINISH),
        withLatestFrom(state$),
        filter(([action, state]) => state.global.selectedMarket.marketId === action.payload.marketId),
        delay(15000),
        mergeMap(([action, state]) => {
            const {selectedMarket, siteConfig} = state.global as GlobalState;
            const {blockNumber} = state.ethereum as EthereumState;
            const {startBlock} = action.payload;
            return of(syncEvent({
                market: selectedMarket, startBlock: blockNumber,
                endBlock: Math.min(startBlock + 1, blockNumber),
                currentBlock: blockNumber, batch: siteConfig.syncBatchBlocks
            }))
        })
    );

export default combineEpics(submitOrderEpic, fillOrderUpToEpic, cancelOrderEpic, requestSyncEventsEpic, syncEventsEpic, startNewRoundSyncEpic);
