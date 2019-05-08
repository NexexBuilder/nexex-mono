import {flags} from '@oclif/command';
import fs from 'fs';
import path from 'path';
import pm2 from 'pm2';
import os from 'os';
import yaml from 'js-yaml';
import Base, {initDir} from '../../Base';

export default class DaemonStart extends Base {
    static description = 'start a local orderbook service';

    static examples = [
        `$ nexex-cli daemon:start
start a local orderbook service at port 3001
`
    ];

    static flags = {
        ...Base.flags,
        config: flags.string({char: 'c'})
    };

    @initDir
    async run() {
        const {flags} = this.parse(DaemonStart);
        const configPath = await this.createTempConfig();
        pm2.connect(function(err) {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            const launcher = require.resolve('../../launcher/mongo');

            pm2.start(
                {
                    name: 'nexex-mongo',
                    script: launcher, // Script to be run
                    exec_mode: 'fork' // Allows your app to be clustered
                },
                function(err, apps) {
                    if (err) throw err;
                    const obLauncher = require.resolve('@nexex/orderbook');
                    pm2.start(
                        {
                            name: 'nexex-orderbook',
                            script: obLauncher, // Script to be run
                            args: ['--config', configPath],
                            exec_mode: 'fork', // Allows your app to be clustered
                            env: {
                                MONGO_URL: 'mongodb://localhost:27018/nest'
                            }
                        },
                        function(err, apps) {
                            pm2.disconnect(); // Disconnects from PM2
                            if (err) throw err;
                        }
                    );
                }
            );
        });
    }

    private async createTempConfig(): Promise<string> {
        const tempPath = path.join(os.tmpdir(), 'nexex');
        const configFile = `${fs.mkdtempSync(tempPath)}/config.yaml`;
        const {config} = await this.readConfig();
        const defaultConfig = yaml.safeLoad(fs.readFileSync(require.resolve('../../../config/config.yaml'), 'utf8'));
        const merged = {
            dexConfig: {
                network: config.network,
                provider: config.provider
            },
            markets: [config.market],
            ...defaultConfig
        };
        fs.writeFileSync(configFile, yaml.safeDump(merged), {encoding: 'utf-8'});
        return configFile;
    }
}
