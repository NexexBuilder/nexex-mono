import {Inject, Injectable} from '@nestjs/common';
import {NewOrderAcceptedEvent, ObEventTypes, OrderbookEvent} from '@nexex/types';
import {EventSource, PeerEvent} from '@nexex/types/orderbook';
import {OrderbookOrderTpl} from '@nexex/types/tpl/orderbook';
import * as Sentry from '@sentry/node';
import {Deserialize, Serialize} from 'cerialize';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import Zmq from 'zeromq';
import {ObConfig} from '../global/global.model';
import logger from '../logger';

const TOPIC = 'ob_event';

@Injectable()
export class ZeromqGateway {
    private pubSock: Zmq.Socket;
    private subSock: Zmq.Socket;

    constructor(@Inject('EventSubject') private events$: Subject<OrderbookEvent>, private config: ObConfig) {
        if (!this.config.isAllInOneNode) {
            if (config.zmq.port) {
                this.pubSock = Zmq.socket('pub');
                this.pubSock.bindSync(`tcp://*:${config.zmq.port}`);
                events$
                    .pipe(filter(event => event.type === ObEventTypes.PEER_EVENT))
                    .subscribe((event: PeerEvent<any>) =>
                        this.handleOutbound({...event.payload, source: EventSource.PEER})
                    );
            }
            if (config.zmq.nodes && config.zmq.nodes.length > 0) {
                this.subSock = Zmq.socket('sub');
                for (const node of config.zmq.nodes) {
                    this.subSock.connect(node);
                }
                this.subSock.subscribe(TOPIC);
                this.subSock.on('message', this.handleInbound.bind(this));
                this.subSock.on('error', (error) => Sentry.captureException(error));
            }
        }
    }

    async handleInbound(topic: Buffer, message: Buffer): Promise<void> {
        if (topic.toString() === TOPIC) {
            const event = JSON.parse(message.toString());
            logger.debug('peer inbound', event);
            switch (event.type) {
                case ObEventTypes.NEW_ORDER_ACCEPTED:
                    logger.debug('zmq: received peers: new order');
                    const order = Deserialize(event.payload.order, OrderbookOrderTpl);
                    this.events$.next({
                        type: event.type,
                        payload: {
                            marketId: event.payload.marketId,
                            order
                        },
                        source: EventSource.PEER
                    });
                    break;
                case ObEventTypes.ORDER_BALANCE_UPDATE:
                case ObEventTypes.ORDER_DELIST:
                    this.events$.next({
                        ...event,
                        source: EventSource.PEER
                    });
                    break;
                default:
            }
        }
    }

    async handleOutbound(payload: NewOrderAcceptedEvent): Promise<void> {
        logger.debug('zmq: notify peers');
        this.pubSock.send([TOPIC, JSON.stringify(Serialize(payload))]);
    }
}
