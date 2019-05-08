import {constants} from '@nexex/api';
import {OrderSide} from '@nexex/types';
import chalk from 'chalk';
import {parseEther} from 'ethers/utils';
import prompts from 'prompts';
import MarketBase from '../../MarketBase';

export default class MarketTrade extends MarketBase {
    static description = 'describe the command here';

    static examples = [
        `$ nexex-cli hello
hello world from ./src/hello.ts!
`
    ];

    static flags = {
        ...MarketBase.flags
    };

    static args = [{name: 'orderHash', required: true}, {name: 'amount'}];

    async run() {
        const {
            flags,
            args: {orderHash, amount}
        } = this.parse(MarketTrade);
        const obClient = this.initObClient(flags);
        const [walletAddr, order] = [
            await this.readWalletAddr(),
            await obClient.queryOrder(orderHash),
            await this.initApi()
        ];

        const {baseTokenAddress, quoteTokenAddress, side, signedOrder} = order;
        const tradeAmount = await this.getAmount(amount, baseTokenAddress);
        console.log(`${chalk.bold(`Amount of ${baseTokenAddress} to buy`)}: ${chalk.yellow(tradeAmount)}`);
        let fillTakenAmount, takerBalance;
        if (side === OrderSide.ASK) {
            fillTakenAmount = (await this.dex.token.parseAmount(baseTokenAddress, tradeAmount))
                .mul(signedOrder.takerTokenAmount)
                .div(signedOrder.makerTokenAmount)
                .add(1);
            takerBalance = await this.dex.token.balanceOf(quoteTokenAddress, walletAddr);
        } else {
            fillTakenAmount = await this.dex.token.parseAmount(baseTokenAddress, tradeAmount);
            takerBalance = await this.dex.token.balanceOf(baseTokenAddress, walletAddr);
        }
        if (fillTakenAmount.gt(takerBalance)) {
            console.log(`no enough balance of ${signedOrder.takerTokenAddress}`);
            console.log(`require: ${fillTakenAmount.toDisplay()}, got: ${takerBalance.toDisplay()}`);
            this.exit(1);
        }
        const wallet = await this.readWallet();
        const tx = await this.dex.exchange.fillOrder(
            wallet.connect(this.dex.eth),
            signedOrder,
            fillTakenAmount,
            constants.NULL_ADDRESS,
            false
        );
        await tx.wait();

        this.exit(0);
    }

    private async getAmount(amount, token) {
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
}
