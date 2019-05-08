import flat from 'flat';
import yaml from 'js-yaml';
import Base, {initDir} from '../../Base';

export default class ConfigList extends Base {
    static description = 'delete a config item';

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
        const config = await this.readConfig();
        const flattened = flat(config);
        delete flattened[key];
        await this.saveConfig(yaml.safeDump(flat.unflatten(flattened)));
    }
}
