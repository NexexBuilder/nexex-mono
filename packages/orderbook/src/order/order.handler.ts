import {Inject, Injectable} from '@nestjs/common';
import {Dex} from '@nexex/api';
import {ObConfig} from '../global/global.model';

import {OrderbookOrder, OrderbookEvent, OrderSide, OrderState, UpdateOrderTask} from '@nexex/types';
import {EventSource, ObEventTypes, OrderDelistEvent, OrderUpdateEvent} from '@nexex/types/orderbook';
import BigNumber from 'bignumber.js';
import {parseEther} from 'ethers/utils';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {EventsModule} from '../events/events.module';
import logger from '../logger';
import {OrderService} from '../order/order.service';
import {bignumberToBignumber} from '../utils/bignumber';

@Injectable()
export class OrderTaskHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderService: OrderService,
        private config: ObConfig,
        private dex: Dex
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.ORDER_UPDATE_TASK))
            .subscribe((event: UpdateOrderTask) => this.handle(event.payload));
    }

    async handle(order: OrderbookOrder): Promise<void> {
        try {
            const availableVolume = bignumberToBignumber(await this.dex.exchange.availableVolume(order.signedOrder));
            const {makerTokenAmount, takerTokenAmount} = order.signedOrder;
            const availableMakerVolume = availableVolume
                .times(makerTokenAmount)
                .div(takerTokenAmount)
                .decimalPlaces(0, BigNumber.ROUND_DOWN);
            let remainingBaseTokenAmount: BigNumber;
            let remainingQuoteTokenAmount: BigNumber;
            if (order.side === OrderSide.ASK) {
                remainingBaseTokenAmount = availableMakerVolume;
                remainingQuoteTokenAmount = availableVolume;
            } else {
                remainingBaseTokenAmount = availableVolume;
                remainingQuoteTokenAmount = availableMakerVolume;
            }
            // remove order if balance is 0 or lower than min amount
            const {minOrderBaseVolumn, minOrderQuoteVolumn} = this.config.marketDefault;
            if (
                remainingBaseTokenAmount.lte(parseEther(String(minOrderBaseVolumn)).toString()) ||
                remainingQuoteTokenAmount.lte(parseEther(String(minOrderQuoteVolumn)).toString())
            ) {
                const lastUpdate = new Date();
                await this.orderService.updateVolume({
                    orderHash: order.orderHash,
                    remainingBaseTokenAmount,
                    remainingQuoteTokenAmount,
                    lastUpdate,
                    state: OrderState.UNFUNDED
                });

                const event: OrderDelistEvent = {
                    type: ObEventTypes.ORDER_DELIST,
                    payload: {
                        marketId: `${order.baseTokenAddress}-${order.quoteTokenAddress}`,
                        orderSide: order.side,
                        baseAmount: remainingBaseTokenAmount.toString(),
                        quoteAmount: remainingQuoteTokenAmount.toString(),
                        lastUpdate,
                        orderHash: order.orderHash
                    },
                    source: EventSource.SELF
                };
                this.events$.next(event);
                this.events$.next({
                    type: ObEventTypes.PEER_EVENT,
                    payload: event
                });
            } else {
                const lastUpdate = new Date();
                await this.orderService.updateVolume({
                    orderHash: order.orderHash,
                    remainingBaseTokenAmount,
                    remainingQuoteTokenAmount,
                    lastUpdate
                });
                const event: OrderUpdateEvent = {
                    type: ObEventTypes.ORDER_BALANCE_UPDATE,
                    payload: {
                        marketId: `${order.baseTokenAddress}-${order.quoteTokenAddress}`,
                        orderSide: order.side,
                        baseAmount: remainingBaseTokenAmount.toString(),
                        quoteAmount: remainingQuoteTokenAmount.toString(),
                        lastUpdate,
                        orderHash: order.orderHash
                    },
                    source: EventSource.SELF
                };
                this.events$.next(event);
                this.events$.next({
                    type: ObEventTypes.PEER_EVENT,
                    payload: event
                });
            }
        } catch (e) {
            logger.error(`failed to fetch availableVolume for incomming order: ${order.orderHash}`);
            logger.error(e.stack);
        }
    }
}
