import {Injectable} from '@nestjs/common';
import {Dex} from '@nexex/api';
import {OrderbookOrder, OrderSide} from '@nexex/types';
import {OrderbookOrderTpl} from '@nexex/types/tpl/orderbook';
import {Deserialize, Serialize} from 'cerialize';
import {pick} from 'lodash';
import {Collection} from 'mongodb';
import {InjectCollection} from '../database/database.util';

@Injectable()
export class OrderService {
    constructor(@InjectCollection('orders') private readonly collection: Collection, private dex: Dex) {
    }

    async findOrder(hash: string): Promise<OrderbookOrder> {
        const record = await this.collection.findOne({orderHash: hash});
        return Deserialize(record, OrderbookOrderTpl);
    }

    async loadOrders(
        baseTokenAddress: string,
        quoteTokenAddress: string,
        side: OrderSide
    ): Promise<OrderbookOrder[]> {
        // tslint:disable object-literal-key-quotes
        const cursor = this.collection.find({
            baseTokenAddress: baseTokenAddress.toLowerCase(),
            quoteTokenAddress: quoteTokenAddress.toLowerCase(),
            side,
            'signedOrder.exchangeContractAddress': this.dex.exchange.getContractAddress().toLowerCase(),
            state: 'OPEN'
        });
        cursor.batchSize(500);
        const result = await cursor.toArray();
        return Deserialize(result, OrderbookOrderTpl);
    }

    async insertOrder(order: OrderbookOrder): Promise<void> {
        const record = Serialize(order, OrderbookOrderTpl);
        record.createdDate = new Date();
        await this.collection.updateOne({orderHash: order.orderHash}, {$setOnInsert: record}, {upsert: true});
    }

    async orderExists(order: OrderbookOrder | string): Promise<boolean> {
        const orderHash = typeof order === 'string' ? order : order.orderHash;
        const count = await this.collection.count({orderHash});
        return count > 0;
    }

    async updateVolume(order: Partial<OrderbookOrder>): Promise<void> {
        const record = Serialize(order, OrderbookOrderTpl);
        record.lastUpdate = new Date();
        await this.collection.updateOne(
            {orderHash: order.orderHash},
            {$set: pick(record, ['remainingBaseTokenAmount', 'remainingQuoteTokenAmount', 'lastUpdate', 'state'])}
        );
    }
}
