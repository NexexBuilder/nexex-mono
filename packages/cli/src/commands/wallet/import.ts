import chalk from 'chalk';
import {Wallet} from 'ethers';
import fs from 'fs';
import prompts from 'prompts';
import Base, {initDir} from '../../Base';
import WalletBase from '../../WalletBase';

export default class WalletImport extends WalletBase {
    static description = 'describe the command here';

    static examples = [
        `$ nexex-cli hello
hello world from ./src/hello.ts!
`
    ];

    static flags = {
        ...WalletBase.flags
    };

    static args = [{name: 'pk'}];

    @initDir
    async run() {
        const {
            flags,
            args: {pk}
        } = this.parse(WalletImport);
        if (fs.existsSync(this.walletPath())) {
            const response = await prompts(
                {
                    type: 'confirm',
                    name: 'answer',
                    message: `Wallet detected. Do you want to overwrite?`
                },
                {onCancel: () => this.exit(1)}
            );
            if (!response.answer) {
                console.log(chalk.yellow('skipped'));
                this.exit(0);
            }
        }
        const passphrase = await this.readPassphrase();
        const wallet = new Wallet(pk);
        fs.writeFileSync(this.walletPath(), await wallet.encrypt(passphrase), {encoding: 'utf-8'});
        console.log(wallet.address, chalk.green(' Imported'));
    }
}
