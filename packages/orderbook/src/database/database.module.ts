import {DynamicModule, Module} from '@nestjs/common';
import {Db} from 'mongodb';
import {databaseProviders} from './database.providers';
import {getCollectionToken} from './database.util';

@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders]
})
export class DatabaseModule {
    static forCollection(names: string[]): DynamicModule {
        const providers = names.map(name => ({
            provide: getCollectionToken(name),
            useFactory: (db: Db) => db.collection(name),
            inject: ['MongoDB']
        }));
        return {
            module: DatabaseModule,
            providers,
            exports: providers
        };
    }
}
