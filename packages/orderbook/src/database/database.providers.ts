import {MongoClient} from 'mongodb';

export const databaseProviders = [
    {
        provide: 'MongoDB',
        useFactory: async () => {
            const client = await MongoClient.connect(
                process.env.MONGO_URL || 'mongodb://localhost:27017/nest',
                {useNewUrlParser: true}
            );
            return client.db();
        }
    }
];
