import {flags} from '@oclif/command';
import chalk from 'chalk';
import pm2 from 'pm2';
import Base, {initDir} from '../../Base';

export default class DaemonStatus extends Base {
    static description = 'query status of orderbook service';

    static flags = {
        ...Base.flags,
        config: flags.string({char: 'c'})
    };

    @initDir
    async run() {
        const {flags} = this.parse(DaemonStatus);
        pm2.connect(function(err) {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            const launcher = require.resolve('../../launcher/mongo');

            pm2.describe('nexex-orderbook', function(err, [app]) {
                pm2.disconnect(); // Disconnects from PM2
                if (!app) {
                    console.log(chalk.bold('not running'));
                    return;
                }
                const {
                    pm2_env: {status, restart_time}
                } = app;
                let statusColor;
                if (status === 'online') {
                    statusColor = chalk.bold(chalk.greenBright(status));
                } else {
                    statusColor = chalk.bold(chalk.redBright(status));
                }
                console.log(chalk.bold('status:'), statusColor);
                console.log(chalk.bold('restart times:'), restart_time);
                if (err) throw err;
            });
        });
    }
}
