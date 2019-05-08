import chalk from 'chalk';
import fs from 'fs';
import {initDir} from '../../Base';
import WalletBase from '../../WalletBase';

export default class WalletShow extends WalletBase {
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
        const {flags} = this.parse(WalletShow);
        if (!fs.existsSync(this.walletPath())) {
            console.log(chalk.yellow('Wallet Not Set'));
            return;
        }
        const encrypted = JSON.parse(fs.readFileSync(this.walletPath(), {encoding: 'utf-8'}));
        const address = encrypted.address.startsWith('0x') ? encrypted.address : `0x${encrypted.address}`;
        console.log(chalk.bold(address));
    }
}
