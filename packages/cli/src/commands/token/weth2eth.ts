import {commify, formatEther, parseEther} from 'ethers/utils';
import {initDir} from '../../Base';
import WalletBase from '../../WalletBase';

export default class TokenWeth2Eth extends WalletBase {
    static description = 'describe the command here';

    static examples = [
        `$ nexex-cli hello
hello world from ./src/hello.ts!
`
    ];

    static flags = {
        ...WalletBase.flags
    };

    static args = [{name: 'amount'}];

    @initDir
    async run() {
        const {
            flags,
            args: {amount}
        } = this.parse(TokenWeth2Eth);
        const [api, walletAddr] = [await this.initApi(), await this.readWalletAddr()];
        const weth = await api.tokenRegistry.getTokenAddressBySymbol('WETH');

        const weiAmount = parseEther(amount);
        const wethBefore = await api.token.balanceOf(weth, walletAddr);
        if (wethBefore.lt(weiAmount)) {
            console.log('not enough balance');
            this.exit(1);
        }

        const wallet = await this.readWallet();
        const tx = await api.token.unwrapEth(wallet.connect(api.eth), weiAmount);
        await tx.wait();

        const [ethBalance, wethBalance] = await Promise.all([
            api.eth.getBalance(wallet.address),
            api.token.balanceOf(weth, wallet.address)
        ]);
        console.log('eth:', commify(formatEther(ethBalance)));
        console.log('weth', commify(formatEther(wethBalance)));
    }
}
