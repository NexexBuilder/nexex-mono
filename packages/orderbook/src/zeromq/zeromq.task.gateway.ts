import {Inject, Injectable} from '@nestjs/common';
import {OrderbookOrderTpl} from '@nexex/types/tpl/orderbook';
import {Deserialize, Serialize} from 'cerialize';
import {UpdateOrderTask, ObEventTypes, OrderbookEvent} from '@nexex/types';
import {Subject} from 'rxjs';
import Zmq from 'zeromq';
import {ObConfig} from '../global/global.model';
import logger from '../logger';

const TOPIC = 'ob_event';

@Injectable()
export class ZeromqTaskGateway {
    private sock: Zmq.Socket;

    constructor(@Inject('EventSubject') private events$: Subject<OrderbookEvent>, private config: ObConfig) {
        if (!this.config.isAllInOneNode) {
            if (this.config.isTaskNode) {
                this.sock = Zmq.socket('push');
                this.sock.bindSync(config.zmq.taskNode);
            } else {
                this.sock = Zmq.socket('pull');
                this.sock.connect(config.zmq.taskNode);
                this.sock.on('message', this.handleInbound.bind(this));
            }
        }
    }

    handleInbound(topic: Buffer, message: Buffer): void {
        if (topic.toString() === TOPIC) {
            logger.info('zmq task received');
            const event = JSON.parse(message.toString());
            logger.info(message.toString());
            if (event.type === ObEventTypes.ORDER_UPDATE_TASK) {
                const order = Deserialize(event.payload, OrderbookOrderTpl);
                this.events$.next({
                    type: event.type,
                    payload: order
                });
            }
        }
    }

    dispatchTask(payload: UpdateOrderTask): void {
        if (!this.config.isTaskNode || this.config.isAllInOneNode) {
            throw new Error('only task node can dispatch tasks');
        }
        logger.debug('zmq dispatch task');
        this.sock.send([TOPIC, JSON.stringify(Serialize(payload))]);
    }
}
