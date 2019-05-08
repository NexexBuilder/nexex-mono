import winston, {format} from 'winston';

export const logger = winston.createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.splat(),
        format.printf(info => {
            return `[${info.level}] ${info.timestamp}: ${info.message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});

export default logger;
