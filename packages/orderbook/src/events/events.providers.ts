import {OrderbookEvent} from '@nexex/types/orderbook';
import {ReplaySubject} from 'rxjs';

export const eventProviders = [
    {
        provide: 'EventSubject',
        useFactory: () => new ReplaySubject<OrderbookEvent>()
    }
];
