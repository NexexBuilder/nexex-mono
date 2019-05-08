import {PlainDexOrder} from '@nexex/types';
import {NewOrderAcceptedEvent, ObEventTypes, OrderbookOrder} from '@nexex/types/orderbook';
import {OrderbookTpl, OrderbookOrderTpl} from '@nexex/types/tpl/orderbook';
import axios from 'axios';
import {Deserialize} from 'cerialize';
import {Subject} from 'rxjs';
import 'socket.io-client';
import SocketIO from 'socket.io-client';
import {Market, Orderbook, OrderbookSlim, OrderbookWsClientConfig} from './';
import Socket = SocketIOClient.Socket;

export class OrderbookWsClient {
    public socket: Socket;
    public events$: Subject<NewOrderAcceptedEvent>;

    private config: OrderbookWsClientConfig;
    private lastSub: {baseTokenAddr: string; quoteTokenAddr: string};

    constructor(config: OrderbookWsClientConfig) {
        this.config = config;
        this.socket = SocketIO(config.url);
        this.events$ = new Subject<NewOrderAcceptedEvent>();
        this.socket.on('orderbook', event => this.events$.next(this.parse(event)));
        this.socket.on('reconnect', () => this.socket.emit('subscribe', this.lastSub));
    }

    /**
     * internally will subscribe two order sequence from ob service
     * @param baseTokenAddr
     * @param quoteTokenAddr
     * @return subscribeId
     * @throws error if not connected
     */
    public subscribe(baseTokenAddr, quoteTokenAddr): void {
        this.lastSub = {baseTokenAddr: baseTokenAddr.toLowerCase(), quoteTokenAddr: quoteTokenAddr.toLowerCase()};
        this.socket.emit('subscribe', this.lastSub);
    }

    // TODO: move orderbook definition to dex-union-types
    // TODO: call rest to get orderbook and deserialization
    public async snapshot(marketId: string, limit?: number): Promise<Orderbook> {
        const res = await axios.get(`${this.config.url}/v1/market/${marketId}`, {
            params: {
                limit,
                minimal: 0
            }
        });
        const orderbook = Deserialize(res.data, OrderbookTpl);
        return orderbook;
    }

    public async topOrders(marketId: string, limit?: number): Promise<OrderbookSlim> {
        const res = await axios.get(`${this.config.url}/v1/market/${marketId}`, {
            params: {
                limit,
                minimal: 1
            }
        });
        return res.data;
    }

    async placeOrder(order: PlainDexOrder): Promise<void> {
        await axios.post(`${this.config.url}/v1/order`, order);
    }

    async queryOrder(orderHash: string): Promise<OrderbookOrder> {
        const res = await axios.get(`${this.config.url}/v1/order/${orderHash}`);
        const order = Deserialize(res.data, OrderbookOrderTpl);
        return order;
    }

    private parse(event) {
        if (event.type === ObEventTypes.NEW_ORDER_ACCEPTED) {
            const {payload} = event as NewOrderAcceptedEvent;
            const order = Deserialize(payload.order, OrderbookOrderTpl);
            return {
                type: event.type,
                payload: {
                    marketId: payload.marketId,
                    order
                }
            };
        }
        return event;
    }

    async markets(): Promise<Market[]> {
        const markets = (await axios.get(`${this.config.url}/v1/market`)).data as any[];
        return markets.map(market => {
            const {base, quote} = market;
            const baseName = base.symbol ? base.symbol : base.addr;
            const quoteName = quote.symbol ? quote.symbol : quote.addr;
            return {base, quote, marketId: `${baseName}-${quoteName}`};
        });
    }

    // public unsubscribe(subscribeId: string): void {}
}
