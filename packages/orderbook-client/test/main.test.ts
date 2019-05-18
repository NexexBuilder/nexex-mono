import {OrderbookWsClient, OrderbookRestClient} from '../src';

describe('snapshot', () => {
    let client: OrderbookWsClient;
    const baseToken = '0x356d019013bb79ce7e303a90a5be91173d80b7b5';
    const quoteToken = '0xd0a1e359811322d97991e03f863a0c30c2cf029c';
    beforeAll(() => {
        client = new OrderbookWsClient({url: 'http://localhost:3001'});
    });

    it('get snapshot', async () => {
        const ob = await OrderbookRestClient.snapshot(`${baseToken}-${quoteToken}`);
        console.log(ob);
        expect(ob).not.toBeUndefined();
    });

    it('get markets', async () => {
        const markets = await OrderbookRestClient.markets();
        console.log(markets);
        expect(markets).not.toBeUndefined();
    });

    it('snapshot(ws)', (done) => {
        client.reqSnapshot(`${baseToken}-${quoteToken}`);
        client.events$.subscribe((evt) => console.log(JSON.stringify(evt)));
    });

    it('req snapshot', (done) => {
        client.reqSnapshot(`${baseToken}-${quoteToken}`);
        client.events$.subscribe((evt) => console.log(JSON.stringify(evt)));
    });

    it.only('req snapshot (minimal)', (done) => {
        client.reqSnapshot(`${baseToken}-${quoteToken}`, 5, false);
        client.events$.subscribe((evt) => console.log(JSON.stringify(evt)));
    });
});
