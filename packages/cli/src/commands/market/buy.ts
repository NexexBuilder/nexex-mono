import {Dex, FeeRate, orderUtil, constants} from '@nexex/api';
import {PlainUnsignedOrder} from '@nexex/types';
import {flags} from '@oclif/command';
import chalk from 'chalk';
import {ethers} from 'ethers';
import {parseEther, parseUnits, getAddress} from 'ethers/utils';
import prompts from 'prompts';
import {FEE_RECIPIENT} from '../../constants';
import MarketBase from '../../MarketBase';
import {Token} from '../../model/Token';

export default class MarketBuy extends MarketBase {
    static description = 'place a buy order to a orderbook relayer';

    static examples = [
        `$ nexex-cli market:buy --amount 0.3 --price 0.11 --expire 1d
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
        const {flags} = this.parse(MarketBuy);
        const {showAddr} = flags;
        this.initObClient(flags);
        const market = await this.getMarket(flags);
        const [base, quote] = market.split('-');
        const init = this.initApi();
        const walletAddr = await this.readWalletAddr();
        await init;
        const [makerToken, takerToken] = await Promise.all([
            Token.create(quote, this.dex),
            Token.create(base, this.dex)
        ]);

        console.log(
            `${chalk.bold('Buy')} ${chalk.green(takerToken.toString(showAddr))}, pay ${chalk.red(
                makerToken.toString(showAddr)
            )}, with account ${walletAddr}`
        );
        const amount = await this.getAmount(flags, base);
        console.log(`${chalk.bold(`Amount of ${takerToken.toString(showAddr)} to buy`)}: ${chalk.yellow(amount)}`);
        const price = await this.getPrice(flags);
        console.log(`${chalk.bold('Price')}: ${chalk.yellow(price)}`);
        const buyAmount = await this.dex.token.parseAmount(takerToken.addr, amount);
        const payAmount = await this.dex.token.formatAmount(
            makerToken.addr,
            buyAmount.mul(parseUnits(price, 8)).div(parseUnits('1', 8))
        );
        console.log(`${chalk.bold(`Amount of ${quote} to pay`)}: ${chalk.yellow(payAmount.toDisplay())}`);
        const expire = await this.getExpire(flags);
        const expireDate = new Date(expire * 1000);
        console.log(`${chalk.bold(`Available before:`)}: ${chalk.yellow(expireDate.toLocaleString())}`);

        const makerTokenBalance = await this.dex.token.balanceOf(makerToken.addr, walletAddr);
        const exchangeContractAddress = this.dex.exchange.getContractAddress();
        const order: PlainUnsignedOrder = {
            maker: walletAddr,
            taker: constants.NULL_ADDRESS,
            makerFeeRecipient: FEE_RECIPIENT,
            makerTokenAddress: makerToken.addr,
            takerTokenAddress: takerToken.addr,
            exchangeContractAddress,
            salt: Dex.generatePseudoRandomSalt(),
            makerFeeRate: FeeRate.from('0.001').toString(),
            takerFeeRate: FeeRate.from('0.001').toString(),
            makerTokenAmount: payAmount.toString(),
            takerTokenAmount: buyAmount.toString(),
            expirationUnixTimestampSec: expire
        };

        if (makerTokenBalance.lte(payAmount)) {
            console.log(
                chalk.red(
                    `no enough balance, require ${quote} ${payAmount.toDisplay()}, own ${makerTokenBalance.toDisplay()}`
                )
            );
            this.exit(1);
        }

        const wallet = await this.readWallet();
        const signed = await this.dex.signOrder(wallet, order);
        const orderHash = orderUtil.getOrderHashHex(signed);
        await this.obClient.placeOrder(signed);
        console.log(`publish ${orderHash} success`);
        this.exit(0);
    }

    private async getTokenAddress(nameOrAddress: string): Promise<string> {
        if (ethers.utils.isHexString(nameOrAddress)) {
            return getAddress(nameOrAddress);
        }
        return this.dex.tokenRegistry.getTokenAddressBySymbol(nameOrAddress);
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
