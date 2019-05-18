import {OrderbookWsClient} from '../src';

describe('snapshot', () => {
    let client: OrderbookWsClient;
    const baseToken = '0x356d019013bb79ce7e303a90a5be91173d80b7b5';
    const quoteToken = '0xd0a1e359811322d97991e03f863a0c30c2cf029c';
    beforeAll(() => {
        client = new OrderbookWsClient({url: 'http://localhost:3001'});
    });

    it('snapshot', async () => {
        const ob = await client.snapshot(`${baseToken}-${quoteToken}`);
        console.log(JSON.stringify(ob));
    });

    it('snapshot(minimal)', async () => {
        const ob = await client.snapshot(`${baseToken}-${quoteToken}`, 5, false);
        console.log(JSON.stringify(ob));
    });

    it('req snapshot', (done) => {
        client.reqSnapshot(`${baseToken}-${quoteToken}`);
        client.events$.subscribe((evt) => console.log(JSON.stringify(evt)));
    });

    it('req snapshot (minimal)', (done) => {
        client.reqSnapshot(`${baseToken}-${quoteToken}`, 5, false);
        client.events$.subscribe((evt) => console.log(JSON.stringify(evt)));
    });

    it('getMarkets', async () => {
        const markets = await client.markets();
        console.log(JSON.stringify(markets));
    });

    it('queryOrder', async () => {
        const order = await client.queryOrder('0x5cd55a427036a08fd73e618e9ad9dd013be71ba36b41ede9760a2be907faa72b');
        console.log(JSON.stringify(order));
    });
});
