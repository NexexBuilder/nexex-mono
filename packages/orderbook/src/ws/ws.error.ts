import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import * as Sentry from '@sentry/node';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        super.catch(exception, host);
        Sentry.captureException(exception);
    }
}
