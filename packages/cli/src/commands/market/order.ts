import {flags} from '@oclif/command';
import chalk from 'chalk';
import Table from 'cli-table3';
import {commify, formatEther} from 'ethers/utils';
import MarketBase from '../../MarketBase';

export default class MarketOrder extends MarketBase {
    static description = 'query top orders from a relayer';

    static examples = [
        `$ nexex-cli market:order --limit 5
`
    ];

    static flags = {
        ...MarketBase.flags,
        limit: flags.integer({char: 'l', default: 5})
    };

    async run() {
        const {flags, args} = this.parse(MarketOrder);
        const obClient = this.initObClient(flags);
        const market = await this.getMarket(flags);
        try {
            const orderBook = await obClient.topOrders(market, flags.limit);

            const [base, quote] = market.split('-');
            console.log(chalk.red('Ask'));
            let table = new Table({
                head: ['Order Hash', `${base} Amount`, `${quote} Amount`, 'Price']
            }) as Table.HorizontalTable;
            orderBook.asks.forEach(order => {
                table.push([
                    order.orderHash,
                    commify(formatEther(order.remainingBaseTokenAmount)),
                    commify(formatEther(order.remainingQuoteTokenAmount)),
                    chalk.red(order.price)
                ]);
            });
            console.log(table.toString());
            console.log(chalk.green('Bid'));
            table = new Table({
                head: ['Order Hash', `${base} Amount`, `${quote} Amount`, 'Price']
            }) as Table.HorizontalTable;
            orderBook.bids.forEach(order => {
                table.push([
                    order.orderHash,
                    this.formatAmount(order.remainingBaseTokenAmount),
                    this.formatAmount(order.remainingQuoteTokenAmount),
                    chalk.green(order.price)
                ]);
            });
            console.log(table.toString());

            process.exit(0);
        } catch (e) {
            if (e.response && e.response.data && e.response.data.message) {
                console.log(e.response.data.message);
            } else {
                console.log(chalk.red('Query orderbook fails'));
            }
            this.exit(1);
        }
    }

    private formatAmount(wei: string) {
        try {
            return commify(formatEther(wei));
        } catch (e) {
            return 'Error';
        }
    }
}
