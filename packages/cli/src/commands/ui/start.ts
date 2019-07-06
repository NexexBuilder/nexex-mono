import {OrderbookRestClient} from '@nexex/orderbook-client';
import express from 'express';
import fs from 'fs';
import Handlerbars from 'handlebars';
import open from 'open';

import Base, {initDir} from '../../Base';

export default class UIStart extends Base {
    static description = 'start a local orderbook service';

    static examples = [
        `$ nexex-cli ui:start
start a local orderbook service at port 3001
`
    ];

    static flags = {
        ...Base.flags,
    };

    @initDir
    async run() {
        const {flags} = this.parse(UIStart);
        await this.launch(flags);
    }

    protected async launch(flags) {
        const app = express();
        const port = 9000;
        const publicPath = `${__dirname}/../../../web-ui`;
        const {endpoint} = flags;
        const ob = new OrderbookRestClient({url: endpoint});
        const info = await ob.serverInfo();

        const config = await this.createConfig({network: info.network, endpoint});

        app.get('/config/config.js', (req, res) => {
            res.end(config, 'utf-8');
        });

        app.use(express.static(publicPath));

        app.listen(port, () => {
            open(`http://localhost:${port}`).then();
            console.log(`nexex-ui on http://localhost:${port}!`);
        });
    }

    private async createConfig(overrides): Promise<string> {
        const configTpl = Handlerbars.compile(
            fs.readFileSync(require.resolve('../../../tpl/ui-config.hb'), {encoding: 'utf-8'})
        );

        return configTpl(overrides);
    }

}
