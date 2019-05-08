import {Test} from '@nestjs/testing';
import {Dex} from '@nexex/api';
import * as mongoUnit from 'mongo-unit';
import {MongoClient} from 'mongodb';
import {DatabaseModule} from '../../src/database/database.module';
import {fromPlainDexOrder} from '../../src/order/order.model';
import {OrderService} from '../../src/order/order.service';
import {generateRandomOrder, initDex} from './helper';

const TEST_ACCOUNT2 = {
    addr: '0x2C035B186c3367A8C874AEfbBAd17cf5d4342aD4',
    pk: '0xc7d8c7c911906d800f683dc6d502c5e43789001a47bd95510a7ef3764285bbcf'
};

describe('Order Module', () => {
    let orderService: OrderService;
    let dex: Dex;

    beforeEach(async () => {
        dex = initDex([TEST_ACCOUNT2]);
        const url = await mongoUnit.start({port: 28017});
        const client = await MongoClient.connect(url);
        const module = await Test.createTestingModule({
            imports: [DatabaseModule, DatabaseModule.forCollection(['orders'])],
            providers: [OrderService]
        })
            .overrideProvider('MongoDB')
            .useValue(client.db())
            .compile();
        orderService = module.get<OrderService>(OrderService);
    });

    afterEach(() => {
        return mongoUnit.drop();
    });

    it('insert order, happy path', async () => {
        const order = await generateRandomOrder(TEST_ACCOUNT2.addr, dex);
        const dexOrder = fromPlainDexOrder(order);
        await orderService.insertOrder(dexOrder);
        const dbOrder = await orderService.findOrder(dexOrder.hash);
        expect(dbOrder).not.toBeUndefined();
    });

    it('load order, happy path', async () => {
        const order = await generateRandomOrder(TEST_ACCOUNT2.addr, dex);
        const dexOrder = fromPlainDexOrder(order);
        await orderService.insertOrder(dexOrder);
        const dbOrder = await orderService.findOrder(dexOrder.hash);

        const orders = await orderService.loadOrders(
            dexOrder.signedOrder.makerTokenAddress,
            dexOrder.signedOrder.takerTokenAddress
        );
        expect(orders.length).toBeGreaterThan(0);
    });
});
