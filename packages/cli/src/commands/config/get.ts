import chalk from 'chalk';
import flat from 'flat';
import Base, {initDir} from '../../Base';

export default class ConfigList extends Base {
    static description = "get a config's value";

    static flags = {
        ...Base.flags
    };

    static args = [{name: 'key'}];

    @initDir
    async run() {
        const {
            flags,
            args: {key}
        } = this.parse(ConfigList);
        const {config} = await this.readConfig();
        const value = flat(config)[key];
        if (value !== undefined) {
            console.log(flat(config)[key]);
        } else {
            console.log(chalk.redBright('key not found'));
        }
    }
}
