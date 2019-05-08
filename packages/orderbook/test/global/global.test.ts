import {Test} from '@nestjs/testing';
import {Dex} from '@nexex/api';
import {ObConfig} from '../../src/global/global.model';
import {GlobalModule} from '../../src/global/global.module';

describe('Global Config', () => {
    it('load yaml config', async () => {
        const module = await Test.createTestingModule({
            imports: [GlobalModule],
            providers: []
        }).compile();
        const config = module.get<ObConfig>(ObConfig);
        expect(config).not.toBeUndefined();
    });

    it('init dex client', async () => {
        const module = await Test.createTestingModule({
            imports: [GlobalModule],
            providers: []
        }).compile();
        const dex = module.get<Dex>(Dex);
        expect(dex).not.toBeUndefined();
    });
});
