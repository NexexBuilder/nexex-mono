import {initDir} from '../../Base';
import {TOKEN_ALLOWANCE_THRESHOLD} from '../../constants';
import WalletBase from '../../WalletBase';

export default class TokenApprove extends WalletBase {
    static description = 'describe the command here';

    static examples = [
        `$ nexex-cli hello
hello world from ./src/hello.ts!
`
    ];

    static flags = {
        ...WalletBase.flags
    };

    static args = [{name: 'token'}];

    @initDir
    async run() {
        const {
            flags,
            args: {token}
        } = this.parse(TokenApprove);
        const api = await this.initApi();
        const [walletAddr, [tokenAddr]] = [await this.readWalletAddr(), await this.tokenToAddr([token])];
        const approve = (await this.dex.token.allowanceForGateway(tokenAddr, walletAddr)).gt(TOKEN_ALLOWANCE_THRESHOLD);
        if (approve) {
            console.log('skip, already approved');
            this.exit(1);
        }
        const wallet = await this.readWallet();
        const tx = await this.dex.token.approveGateway(wallet.connect(api.eth), tokenAddr);
        await tx.wait();
        console.log('Done');
    }
}
