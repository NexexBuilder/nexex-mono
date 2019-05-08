import {Dex} from '@nexex/api';
import {ObConfig} from './global.model';

export const DexProvider = {
    provide: Dex,
    inject: [ObConfig],
    useFactory: async (config: ObConfig) => {
        const dex = await Dex.create(config.dexConfig);
        return dex;
    }
};
