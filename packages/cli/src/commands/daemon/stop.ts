import {flags} from '@oclif/command';
import pm2 from 'pm2';
import Base, {initDir} from '../../Base';

export default class DaemonStop extends Base {
    static description = 'stop the services';

    static examples = [
        `$ nexex-cli hello
hello world from ./src/hello.ts!
`
    ];

    static flags = {
        ...Base.flags,
        config: flags.string({char: 'c'})
    };

    @initDir
    async run() {
        const {flags} = this.parse(DaemonStop);
        pm2.connect(function(err) {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            pm2.delete('nexex-orderbook', function(err, apps) {
                pm2.delete('nexex-mongo', function(err, apps) {
                    pm2.disconnect(); // Disconnects from PM2
                });
            });
        });
    }
}
