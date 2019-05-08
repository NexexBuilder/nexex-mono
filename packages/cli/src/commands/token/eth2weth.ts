import {commify, formatEther, parseEther} from 'ethers/utils';
import {initDir} from '../../Base';
import WalletBase from '../../WalletBase';

export default class TokenEth2Weth extends WalletBase {
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
        } = this.parse(TokenEth2Weth);
        const [api, walletAddr] = [await this.initApi(), await this.readWalletAddr()];

        const weiAmount = parseEther(amount);
        const ethBefore = await api.eth.getBalance(walletAddr);
        if (ethBefore.lt(weiAmount)) {
            console.log('not enough balance');
            this.exit(1);
        }

        const wallet = await this.readWallet();
        const tx = await api.token.wrapEth(wallet.connect(api.eth), weiAmount);
        const [_, weth] = [await tx.wait(), await api.tokenRegistry.getTokenAddressBySymbol('WETH')];

        const [ethBalance, wethBalance] = await Promise.all([
            api.eth.getBalance(wallet.address),
            api.token.balanceOf(weth, wallet.address)
        ]);
        console.log('eth:', commify(formatEther(ethBalance)));
        console.log('weth', commify(formatEther(wethBalance)));
    }
}
