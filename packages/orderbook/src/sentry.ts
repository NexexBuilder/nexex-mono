import * as Sentry from '@sentry/node';

export function setupSentry() {
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.SENTRY_ENV,
        });
    }
}

