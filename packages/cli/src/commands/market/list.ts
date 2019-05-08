import Table from 'cli-table3';
import MarketBase from '../../MarketBase';
import {Token} from '../../model/Token';

export default class MarketList extends MarketBase {
    static description = 'describe the command here';

    static examples = [
        `$ nexex-cli hello
hello world from ./src/hello.ts!
`
    ];

    static flags = {
        ...MarketBase.flags
    };

    async run() {
        const {flags} = this.parse(MarketList);
        const obClient = this.initObClient(flags);
        const markets = await obClient.markets();
        const {showAddr} = flags;
        const table = new Table({
            head: ['Market']
            // colWidths: [10, 100, 100]
        }) as Table.HorizontalTable;
        markets.forEach(({base, quote}) => {
            const baseToken = new Token(base.symbol, base.addr);
            const quoteToken = new Token(quote.symbol, quote.addr);
            table.push([`${baseToken.toString(showAddr)}-${quoteToken.toString(showAddr)}`]);
        });
        console.log(table.toString());
        // console.log(JSON.stringify(markets, null, 4));
        process.exit(0);
    }
}
