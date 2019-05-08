import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {Dex, orderUtil} from '@nexex/api';
import * as mongoUnit from 'mongo-unit';
import {MongoClient} from 'mongodb';
import request from 'supertest';
import {OrderService} from '../../src/order/order.service';
import {AppModule} from './../../src/app.module';
import {generateRandomOrder, initDex} from './helper';

const TEST_ACCOUNT2 = {
    addr: '0x2C035B186c3367A8C874AEfbBAd17cf5d4342aD4',
    pk: '0xc7d8c7c911906d800f683dc6d502c5e43789001a47bd95510a7ef3764285bbcf'
};

describe('OrderController (e2e)', () => {
    let app: INestApplication;
    let orderService: OrderService;
    let dex: Dex;

    beforeAll(async () => {
        const url = await mongoUnit.start({port: 28017});
        const client = await MongoClient.connect(
            url,
            {useNewUrlParser: true}
        );
        dex = initDex([TEST_ACCOUNT2]);
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideProvider('MongoDB')
            .useValue(client.db())
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        orderService = moduleFixture.get<OrderService>(OrderService);
    });

    afterAll(() => {
        return mongoUnit.drop();
    });

    it('/POST /v1/order', async () => {
        const order = await generateRandomOrder(TEST_ACCOUNT2.addr, dex);

        await request(app.getHttpServer())
            .post('/v1/order')
            .send(order)
            .expect(201)
            .expect({result: 'success'});
        const orderInDb = await orderService.findOrder(orderUtil.getOrderHashHex(order));
        expect(orderInDb).not.toBeUndefined();
    });
});
