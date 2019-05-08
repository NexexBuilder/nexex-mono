import chalk from 'chalk';
import Table from 'cli-table3';
import {BigNumber, commify, formatEther} from 'ethers/utils';
import {initDir} from '../../Base';
import {TOKEN_ALLOWANCE_THRESHOLD} from '../../constants';
import WalletBase from '../../WalletBase';

export default class TokenShow extends WalletBase {
    static description = 'describe the command here';

    static examples = [
        `$ nexex-cli hello
hello world from ./src/hello.ts!
`
    ];

    static flags = {
        ...WalletBase.flags
    };

    @initDir
    async run() {
        const {flags} = this.parse(TokenShow);
        const walletAddr = this.readWalletAddr();
        if (!walletAddr) {
            console.log(chalk.yellow('Wallet Not Set'));
            this.exit(1);
        }
        await this.initApi();
        const {
            config: {tokens = []}
        } = await this.readConfig();

        const queryTokens = await this.tokenToAddr(['WETH', ...tokens]);

        const [ethBalance, [wethBalance, ...tokenBalances]] = [
            await this.ethBalance(walletAddr),
            await Promise.all(
                queryTokens.map(tokenAddr => this.dex.token.balanceOf(tokenAddr, walletAddr).catch(() => 'Error'))
            )
        ];

        const [wethAllowrance, ...tokenAllowrances] = await Promise.all(
            queryTokens.map(tokenAddr => this.dex.token.allowanceForGateway(tokenAddr, walletAddr).catch(() => 'Error'))
        );

        const table = new Table({
            head: ['Token', 'Balance', 'Unit', 'ApproveStatus']
        }) as Table.HorizontalTable;
        table.push(['ETH', commify(formatEther(ethBalance)), 'Ether', '']);
        table.push([
            'WETH',
            wethBalance === 'Error' ? 'Error' : commify(formatEther(wethBalance)),
            'Ether',
            wethAllowrance === 'Error' ? 'Error' : (wethAllowrance as BigNumber).gt(TOKEN_ALLOWANCE_THRESHOLD)
        ]);
        tokenBalances.forEach((tokenBalance, idx) => {
            table.push([
                tokens[idx],
                tokenBalance === 'Error' ? 'Error' : commify(formatEther(tokenBalance)),
                'Ether',
                tokenAllowrances[idx] === 'Error'
                    ? 'Error'
                    : (tokenAllowrances[idx] as BigNumber).gt(TOKEN_ALLOWANCE_THRESHOLD)
            ]);
        });

        console.log(table.toString());
    }

    protected async ethBalance(addr: string) {
        return this.dex.eth.getBalance(addr);
    }
}
