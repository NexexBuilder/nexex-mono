import {Global, Module} from '@nestjs/common';
import {ConfigProvider} from './config.provider';
import {DexProvider} from './dex.provider';

@Global()
@Module({
    imports: [],
    providers: [ConfigProvider, DexProvider],
    exports: [ConfigProvider, DexProvider]
})
export class GlobalModule {}
