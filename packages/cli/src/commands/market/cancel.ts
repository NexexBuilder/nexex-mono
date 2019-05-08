import {parseEther} from 'ethers/utils';
import MarketBase from '../../MarketBase';

export default class MarketCancel extends MarketBase {
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
        } = this.parse(MarketCancel);
        const obClient = this.initObClient(flags);
        const [walletAddr, _, order] = await Promise.all([
            this.readWalletAddr(),
            this.initApi(),
            obClient.queryOrder(orderHash)
        ]);
        if (walletAddr.toLowerCase() !== order.signedOrder.maker.toLowerCase()) {
            console.log('not maker of order');
            this.exit(1);
        }
        const wallet = await this.readWallet();
        let cancelAmount = amount ? parseEther(amount) : undefined;
        const tx = await this.dex.exchange.cancelOrder(wallet.connect(this.dex.eth), order.signedOrder, cancelAmount);
        await tx.wait();
        console.log(`cancel ${orderHash} success`);
        this.exit(0);
    }
}
