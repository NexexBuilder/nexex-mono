import {Module} from '@nestjs/common';
import {ZeromqGateway} from './zeromq.gateway';
import {ZeromqTaskGateway} from './zeromq.task.gateway';

@Module({
    providers: [ZeromqGateway, ZeromqTaskGateway],
    exports: [ZeromqTaskGateway]
})
export class ZeromqModule {}
