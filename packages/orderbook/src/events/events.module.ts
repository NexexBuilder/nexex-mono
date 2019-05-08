import {Global, Module} from '@nestjs/common';
import {eventProviders} from './events.providers';

@Module({
    providers: [...eventProviders],
    exports: [...eventProviders]
})
@Global()
export class EventsModule {
    static EventSubject: string = 'EventSubject';
}
