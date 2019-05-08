import {BaseError} from './BaseError';

export class NoProviderFoundError extends BaseError {
    public name: string = 'NoProviderFoundError';

    constructor() {
        super('NoProviderFoundError');
    }
}
