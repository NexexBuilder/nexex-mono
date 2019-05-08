import cosmiconfig from 'cosmiconfig';
import merge from 'lodash/merge';
import {argv} from 'yargs';
import logger from '../logger';
import {ObConfig} from './global.model';

const moduleName = '@nexex/orderbook';

const DEFAULT_CONFIG: Partial<ObConfig> = {
    marketDefault: {
        minOrderBaseVolumn: '0.01',
        minOrderQuoteVolumn: '0.001',
        minMakerFeeRate: '0.001',
        makerRecipient: '0xDCb23BDacbB3360F16a91127391525EAf7711877'
    },
    ipfs: {
        enabled: true,
        repo: 'ipfs-private',
        prefix: '@nexex-'
    }
};

export const ConfigProvider = {
    provide: ObConfig,
    useFactory: async () => {
        const explorer = cosmiconfig(moduleName, {
            searchPlaces: [
                'package.json',
                `./env_settings/config.json`,
                `./env_settings/config.yaml`,
                `./env_settings/config.yml`,
                `./env_settings/config.js`
            ]
        });
        let searchRes;
        if (argv.config) {
            searchRes = await explorer.load(argv.config as string);
        } else {
            searchRes = await explorer.search();
        }
        logger.info(`load config from: ${searchRes.filepath}`);
        const envConfig = process.env.appConfig ? JSON.parse(process.env.appConfig) : {};
        const config = new ObConfig(merge({}, DEFAULT_CONFIG, searchRes.config, envConfig));
        return config;
    }
};
