import {ArgumentMetadata, Injectable, PipeTransform, BadRequestException} from '@nestjs/common';
import {orderUtil} from '@nexex/api';
import {PlainDexOrder} from '@nexex/types';

@Injectable()
export class RestValidation implements PipeTransform {
    constructor() {}

    transform(value: PlainDexOrder, metadata: ArgumentMetadata) {
        // if (this.orderFilter.filterOrderByBlackList(value)) {
        //   throw new NotAcceptableException('HIT WHITELIST');
        // }
        // if (this.orderFilter.filterOrderByBlackList(value)) {
        //   throw new NotAcceptableException('HIT BLACKLIST');
        // }
        if (!orderUtil.isValidOrder(value)) {
            throw new BadRequestException('NOT VERIFIED');
        }
        return value;
    }
}
