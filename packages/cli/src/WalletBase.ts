import {Dex} from '@nexex/api';
import chalk from 'chalk';
import {Wallet} from 'ethers';
import fs from 'fs';
import prompts from 'prompts';
import Base from './Base';

export default abstract class WalletBase extends Base {
    static flags = {
        ...Base.flags
    };

    protected dex: Dex;

    protected async readPassphrase(): Promise<string> {
        const response = await prompts(
            {
                type: 'password',
                name: 'passphrase',
                message: 'passphrase for the wallet',
                validate: input => (!input || input === '' ? 'Passphrase is required.' : true)
            },
            {onCancel: () => this.exit(1)}
        );
        return response.passphrase;
    }

    protected walletPath() {
        return `${this.homeDir}/wallet.json`;
    }

    protected readWalletAddr() {
        this.checkWallet();
        try {
            const encrypted = JSON.parse(fs.readFileSync(this.walletPath(), {encoding: 'utf-8'}));
            const address = encrypted.address.startsWith('0x') ? encrypted.address : `0x${encrypted.address}`;
            return address;
        } catch (e) {
            console.log(chalk.red('read wallet fails'));
            return;
        }
    }

    protected checkWallet() {
        if (!fs.existsSync(this.walletPath())) {
            console.log(chalk.red('wallet not exists. use nexex-cli wallet:import to create one first.'));
            this.exit(1);
        }
    }

    protected async readWallet() {
        this.checkWallet();
        const passphrase = await this.readPassphrase();
        const encrypted = fs.readFileSync(this.walletPath(), {encoding: 'utf-8'});
        return Wallet.fromEncryptedJson(encrypted, passphrase);
    }

    protected async initApi() {
        const dexConfig = await this.getDexConfig();
        this.dex = await Dex.create(dexConfig);
        return this.dex;
    }

    protected async tokenToAddr(tokens: string[]): Promise<string[]> {
        const tokenPromises = tokens.map(token => {
            if (token.startsWith('0x')) {
                return Promise.resolve(token);
            } else {
                return this.dex.tokenRegistry.getTokenAddressBySymbol(token.toUpperCase());
            }
        });
        return Promise.all(tokenPromises);
    }
}
