import {NestFactory} from '@nestjs/core';
import {setupSentry} from '@nexex/orderbook/sentry';
import dotenv from 'dotenv';
import {argv} from 'yargs';
import {AppModule} from './app.module';

dotenv.config();

async function bootstrap() {
    setupSentry();
    const app = await NestFactory.create(AppModule);
    const port = (argv.port as string) || process.env.PORT || 3001;
    await app.listen(port);
}
bootstrap();
