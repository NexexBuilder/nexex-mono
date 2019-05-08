import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {OrderbookOrder, PlainDexOrder} from '@nexex/types';
import logger from '../logger';
import {OrderbookService} from '../orderbook/orderbook.service';

@Injectable()
export class DexOrderPipe implements PipeTransform<PlainDexOrder, Promise<OrderbookOrder>> {
    constructor(private orderbookService: OrderbookService) {}

    async transform(value: PlainDexOrder, metadata: ArgumentMetadata): Promise<OrderbookOrder> {
        try {
            return this.orderbookService.validateOrder(value);
        } catch (e) {
            logger.error(e);
            throw new BadRequestException(e.message);
        }
    }
}
