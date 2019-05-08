import {Dex, DexConfig} from '@nexex/api';
import {Command, flags} from '@oclif/command';
import fs from 'fs';
import os from 'os';
import cosmiconfig from 'cosmiconfig';

const moduleName = 'nexex';
export default abstract class Base extends Command {
    static flags = {
        help: flags.help({char: 'h'}),
        endpoint: flags.string({char: 'e', default: 'http://localhost:3001'}),
        showAddr: flags.boolean({char: 'a', default: false})
    };

    protected initDir(): void {
        if (!fs.existsSync(this.homeDir)) {
            fs.mkdirSync(this.homeDir);
        }
        if (!fs.existsSync(this.defaultConfig)) {
            fs.copyFileSync(require.resolve('../config/user.yaml'), this.defaultConfig);
        }
    }

    protected async readConfig() {
        const explorer = cosmiconfig(moduleName, {
            searchPlaces: [`.${moduleName}rc.yaml`, '.nexex/config.yaml']
        });
        const searchRes = await explorer.search();
        return searchRes;
    }

    protected async saveConfig(newConfig) {
        const {filepath} = await this.readConfig();
        fs.writeFileSync(filepath, newConfig, {encoding: 'utf-8'});
    }

    protected get homeDir(): string {
        return `${os.homedir()}/.nexex`;
    }

    protected get defaultConfig(): string {
        return `${this.homeDir}/config.yaml`;
    }

    protected async getDexConfig(): Promise<DexConfig> {
        const {
            config: {network, provider}
        } = await this.readConfig();
        return {network, provider} as DexConfig;
    }
}

export function initDir(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args) => any>
) {
    const origin = descriptor.value;
    descriptor.value = function(...args) {
        this.initDir();
        return origin.apply(this, args);
    };
}
