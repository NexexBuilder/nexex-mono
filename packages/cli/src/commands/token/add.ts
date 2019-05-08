import {Dex} from '@nexex/api';
import chalk from 'chalk';
import {getAddress} from 'ethers/utils';
import yaml from 'js-yaml';
import {initDir} from '../../Base';
import WalletBase from '../../WalletBase';

export default class TokenAdd extends WalletBase {
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

    protected dex: Dex;
    @initDir
    async run() {
        const {
            flags,
            args: {token}
        } = this.parse(TokenAdd);
        const {config} = await this.readConfig();
        const {tokens = []} = config;
        if (tokens.length > 5) {
            console.log(chalk.yellow('reach max token limit'));
            this.exit(1);
        }
        let tokenToAdd = token;
        if (token.startsWith('0x')) {
            this.dex = await this.initApi();
            tokenToAdd = getAddress(token);
            const tokenMeta = await this.dex.tokenRegistry.getTokenMetaData(tokenToAdd);
            if (tokenMeta) {
                tokenToAdd = tokenMeta.symbol;
            }
        }
        if (tokens.includes(tokenToAdd) || tokenToAdd === 'WETH') {
            console.log(chalk.yellow('duplicate token'));
            this.exit(1);
        }
        tokens.push(tokenToAdd);
        config.tokens = tokens;
        await this.saveConfig(yaml.dump(config));
    }
}
