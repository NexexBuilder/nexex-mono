import {OrderbookRestClient} from '@nexex/orderbook-client';
import {flags} from '@oclif/command';
import Table from 'cli-table3';
import prompts from 'prompts';
import {Token} from './model/Token';
import WalletBase from './WalletBase';

export default abstract class MarketBase extends WalletBase {
    static flags = {
        ...WalletBase.flags,
        market: flags.string()
    };

    protected obClient: OrderbookRestClient;

    protected initObClient(flags: any): OrderbookRestClient {
        const {endpoint} = flags;
        this.obClient = new OrderbookRestClient({url: endpoint});
        return this.obClient;
    }

    protected async queryMarkets(flags) {
        return this.obClient.markets();
    }

    protected async getMarket(flags): Promise<string> {
        const markets = await this.queryMarkets(flags);
        const {market: marketInput, showAddr} = flags;
        if (markets.findIndex(market => marketInput && market.marketId === marketInput) >= 0) {
            return marketInput;
        } else {
            //ask user
            const table = new Table({
                head: ['', 'Market']
                // colWidths: [10, 100, 100]
            }) as Table.HorizontalTable;
            markets.forEach(({base, quote}, idx) => {
                const baseToken = new Token(base.symbol, base.addr);
                const quoteToken = new Token(quote.symbol, quote.addr);
                table.push([idx, `${baseToken.toString(showAddr)}-${quoteToken.toString(showAddr)}`]);
            });
            console.log(table.toString());
            const response = await prompts(
                {
                    type: 'number',
                    name: 'marketId',
                    initial: 0,
                    min: 0,
                    max: markets.length - 1,
                    message: `Select a market`
                },
                {onCancel: () => this.exit(1)}
            );
            return markets[response.marketId].marketId;
        }
    }
}
