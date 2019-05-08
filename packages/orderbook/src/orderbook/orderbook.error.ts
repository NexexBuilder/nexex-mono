import {BaseError} from '../error';

export class OrderbookNotExist extends BaseError {
    name: string = 'OrderbookNotExist';
    constructor() {
        super('Orderbook Not Exist');
    }
}

export class FailToQueryAvailableVolume extends BaseError {
    name: string = 'FailToQueryAvailableVolume';
    constructor() {
        super('FailToQueryAvailableVolume');
    }
}

export class OrderAmountTooSmall extends BaseError {
    name: string = 'OrderAmountTooSmall';
    constructor(requires: string, actual: string) {
        super(`Order Amount Too Small, requires: ${requires}, actual: ${actual}`);
    }
}
