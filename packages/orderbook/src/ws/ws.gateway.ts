import {Inject} from '@nestjs/common';
import {OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse} from '@nestjs/websockets';
import {DownstreamEvent, ObEventTypes, OrderbookEvent, WsRpcRequest} from '@nexex/types/orderbook';
import {Serialize} from 'cerialize';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Server, Socket} from 'socket.io';
import logger from '../logger';
import {MarketCommandPayload} from './ws.model';

@WebSocketGateway()
export class WsGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    constructor(@Inject('EventSubject') private events$: Subject<OrderbookEvent>) {}

    /**
     * subscribe new order of this market
     * on client can only subscribe one market, exit others when subscribe a new one
     * @param client
     * @param market
     */
    @SubscribeMessage('subscribe')
    onSubscribe(client: Socket, market: MarketCommandPayload): WsResponse<string> {
        const marketKey = `${market.baseTokenAddr}-${market.quoteTokenAddr}`;
        for (const roomId of Object.keys(client.rooms)) {
            if (roomId !== client.id && roomId !== marketKey) {
                client.leave(roomId);
            }
        }
        logger.info('user subscribe %s', marketKey);
        client.join(marketKey);

        return {event: 'subscribe', data: 'success'};
    }

    @SubscribeMessage('rpc')
    onNotify(client: Socket, req: WsRpcRequest): void {
        this.events$.next({
            type: ObEventTypes.WS_UPSTREAM_EVENT,
            from: client.id,
            payload: req
        });
    }

    afterInit(server: Server): any {
        this.events$
            .pipe(filter(event => event.type === ObEventTypes.DOWNSTREAM_EVENT))
            .subscribe((event: DownstreamEvent) => {
                const wrappedEvent = event.payload;
                return this.server
                    .to(event.to)
                    .emit('orderbook', {type: wrappedEvent.type, payload: Serialize(wrappedEvent.payload), id: wrappedEvent.id});
            });
    }
}
