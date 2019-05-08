import {Dex} from '@nexex/api/Dex';
import chalk from 'chalk';

export class Token {
    static async create(tokenSymbolOrAddr: string, dex: Dex): Promise<Token> {
        if (tokenSymbolOrAddr.startsWith('0x')) {
            const addr = tokenSymbolOrAddr;
            const token = (await dex.tokenRegistry.getTokenMetaData(addr)) || ({} as any);
            return new Token(token.symbol, addr, token.decimals);
        } else {
            const token = await dex.tokenRegistry.getTokenBySymbol(tokenSymbolOrAddr.toUpperCase());
            if (!token) {
                throw new Error(`${tokenSymbolOrAddr} not registered`);
            }
            return new Token(token.symbol, token.addr, token.decimals);
        }
    }

    constructor(public symbol: string, public addr: string, public decimals?: number) {}

    toString(showAddr: boolean = false) {
        if (showAddr) {
            return this.symbol ? `${this.symbol}(${chalk.yellow(this.addr)})` : `${chalk.yellow(this.addr)}`;
        } else {
            return this.symbol ? `${this.symbol}` : `${this.addr}`;
        }
    }
}
