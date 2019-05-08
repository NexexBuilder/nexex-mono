import {OrderbookWsClient} from '../src';

describe('snapshot', () => {
    let client: OrderbookWsClient;
    const baseToken = '0x1dad4783cf3fe3085c1426157ab175a6119a04ba';
    const quoteToken = '0xd0a1e359811322d97991e03f863a0c30c2cf029c';
    beforeAll(() => {
        client = new OrderbookWsClient({url: 'http://localhost:3001'});
    });

    it('get snap shot', async () => {
        const ob = await client.snapshot(baseToken, quoteToken);
        console.log(ob);
        expect(ob).not.toBeUndefined();
    });

    it('get markets', async () => {
        const markets = await client.markets();
        console.log(markets);
        expect(markets).not.toBeUndefined();
    });
});
