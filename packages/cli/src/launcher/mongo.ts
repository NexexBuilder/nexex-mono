import fs from 'fs';
import {MongodHelper} from 'mongodb-prebuilt';
import os from 'os';

async function main() {
    const dataDir = `${os.homedir()}/.nexex/mongo`;
    const mongodHelper = new MongodHelper(['--port', '27018', '--dbpath', dataDir], {
        version: '4.0.8'
    });

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    await mongodHelper.run().then(
        started => {
            console.log('mongod is running');
        },
        e => {
            console.log('error starting', e);
        }
    );
}

main();
