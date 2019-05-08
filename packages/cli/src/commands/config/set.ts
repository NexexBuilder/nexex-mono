import Base, {initDir} from '../../Base';
import flat from 'flat';
import yaml from 'js-yaml';

export default class ConfigList extends Base {
    static description = 'set a config item';

    static flags = {
        ...Base.flags
    };

    static args = [{name: 'key'}, {name: 'value'}];

    @initDir
    async run() {
        const {
            flags,
            args: {key, value}
        } = this.parse(ConfigList);
        const {config} = await this.readConfig();
        const flattened = flat(config);
        flattened[key] = value;
        await this.saveConfig(yaml.safeDump(flat.unflatten(flattened)));
    }
}
