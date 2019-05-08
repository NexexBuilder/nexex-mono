import {Dex, FeeRate, orderUtil, constants} from '@nexex/api';
import {PlainUnsignedOrder} from '@nexex/types';
import {flags} from '@oclif/command';
import chalk from 'chalk';
import {ethers} from 'ethers';
import {parseEther, parseUnits} from 'ethers/utils';
import prompts from 'prompts';
import {FEE_RECIPIENT} from '../../constants';
import MarketBase from '../../MarketBase';

export default class MarketSell extends MarketBase {
    static description = 'place a sell order to a orderbook relayer';

    static examples = [
        `$ nexex-cli market:sell --amount 0.3 --price 0.11 --expire 1d
        Enter the passphrase to use the wallet and sign the order. 
`
    ];

    static flags = {
        ...MarketBase.flags,
        amount: flags.string(),
        price: flags.string(),
        expire: flags.string()
    };

    async run() {
        const {flags} = this.parse(MarketSell);
        const {
            config: {market}
        } = await this.readConfig();
        const [base, quote] = market.split('-');
        const obClient = this.initObClient(flags);
        const init = this.initApi();
        const walletAddr = await this.readWalletAddr();

        console.log(
            `${chalk.bold('Sell')} ${chalk.green(base)}, to exchange ${chalk.red(quote)}, with account ${walletAddr}`
        );
        const amount = await this.getAmount(flags, base);
        console.log(`${chalk.bold(`Amount of ${base} to sell`)}: ${chalk.yellow(amount)}`);
        const price = await this.getPrice(flags);
        console.log(`${chalk.bold('Price')}: ${chalk.yellow(price)}`);
        await init;
        const [makerTokenAddress, takerTokenAddress] = await Promise.all([
            this.getTokenAddress(base),
            this.getTokenAddress(quote)
        ]);
        const sellAmount = await this.dex.token.parseAmount(makerTokenAddress, amount);
        const exchangeAmount = await this.dex.token.formatAmount(
            takerTokenAddress,
            sellAmount.mul(parseUnits(price, 8)).div(parseUnits('1', 8))
        );
        console.log(`${chalk.bold(`Amount of ${quote} to exchange`)}: ${chalk.yellow(exchangeAmount.toDisplay())}`);
        const expire = await this.getExpire(flags);
        const expireDate = new Date(expire * 1000);
        console.log(`${chalk.bold(`Available before:`)}: ${chalk.yellow(expireDate.toLocaleString())}`);
        const makerTokenBalance = await this.dex.token.balanceOf(makerTokenAddress, walletAddr);
        const exchangeContractAddress = this.dex.exchange.getContractAddress();
        const order: PlainUnsignedOrder = {
            maker: walletAddr,
            taker: constants.NULL_ADDRESS,
            makerFeeRecipient: FEE_RECIPIENT,
            makerTokenAddress,
            takerTokenAddress,
            exchangeContractAddress,
            salt: Dex.generatePseudoRandomSalt(),
            makerFeeRate: FeeRate.from('0.001').toString(),
            takerFeeRate: FeeRate.from('0.001').toString(),
            makerTokenAmount: sellAmount.toString(),
            takerTokenAmount: exchangeAmount.toString(),
            expirationUnixTimestampSec: expire
        };

        if (makerTokenBalance.lte(sellAmount)) {
            console.log(
                chalk.red(
                    `no enough balance, require ${base} ${sellAmount.toDisplay()}, own ${makerTokenBalance.toDisplay()}`
                )
            );
            this.exit(1);
        }

        const wallet = await this.readWallet();
        const signed = await this.dex.signOrder(wallet, order);
        const orderHash = orderUtil.getOrderHashHex(signed);
        await obClient.placeOrder(signed);
        console.log(`publish ${orderHash} success`);
        this.exit(0);
    }

    private async getTokenAddress(nameOrAddress: string): Promise<string> {
        if (ethers.utils.isHexString(nameOrAddress)) {
            return nameOrAddress.toLowerCase();
        }
        return (await this.dex.tokenRegistry.getTokenAddressBySymbol(nameOrAddress)).toLowerCase();
    }

    private async getAmount(flags, token) {
        const {amount} = flags;
        if (amount) {
            return amount;
        }
        const response = await prompts(
            {
                type: 'text',
                name: 'amount',
                message: `Enter the amount of ${token} to buy? (unit: ether)`,
                validate: input => {
                    try {
                        parseEther(input);
                        return true;
                    } catch (e) {
                        return 'not a valid number';
                    }
                }
            },
            {onCancel: () => this.exit(1)}
        );
        return response.amount;
    }

    private async getPrice(flags) {
        const {price} = flags;
        if (price) {
            return price;
        }
        const response = await prompts(
            {
                type: 'text',
                name: 'price',
                message: `Enter the price (8 decimals at most):`,
                validate: input => {
                    try {
                        parseUnits(input, 8);
                        return true;
                    } catch (e) {
                        return 'not a valid price';
                    }
                }
            },
            {onCancel: () => this.exit(1)}
        );
        return response.price;
    }

    private async getExpire(flags) {
        let {expire} = flags;
        const reg = /^(\d+)\s*(d|h|m|s)$/;
        if (!expire || !reg.exec(expire)) {
            const response = await prompts(
                {
                    type: 'text',
                    name: 'expire',
                    message: `Enter the expire: ? [d/h/s]`,
                    initial: '1d',
                    validate: input => {
                        if (!reg.exec(input)) {
                            return 'not a valid input';
                        }
                        return true;
                    }
                },
                {onCancel: () => this.exit(1)}
            );
            expire = response.expire;
        }

        const [_, number, unit] = reg.exec(expire);
        const now = Math.round(new Date().getTime() / 1000) + 1;
        if (unit === 's') {
            return now + Number(number);
        } else if (unit === 'm') {
            return now + Number(number) * 60;
        } else if (unit === 'h') {
            return now + Number(number) * 60 * 60;
        } else if (unit === 'd') {
            return now + Number(number) * 60 * 60 * 24;
        }
    }
}
