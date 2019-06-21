import {NestFactory} from '@nestjs/core';
import dotenv from 'dotenv';
import {argv} from 'yargs';
dotenv.config();
import {AppModule} from './app.module';
import {setupSentry} from './sentry';


async function bootstrap() {
    setupSentry();
    const app = await NestFactory.create(AppModule);
    const port = (argv.port as string) || process.env.PORT || 3001;
    await app.listen(port);
}
bootstrap();
