import {NestFactory} from '@nestjs/core';
import {argv} from 'yargs';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = (argv.port as string) || process.env.PORT || 3001;
    await app.listen(port);
}
bootstrap();
