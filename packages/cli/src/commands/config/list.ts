import chalk from 'chalk';
import Table from 'cli-table3';
import flat from 'flat';
import Base, {initDir} from '../../Base';

export default class ConfigList extends Base {
    static description = 'list all configs';

    static flags = {
        ...Base.flags
    };

    static args = [{name: 'file'}];

    @initDir
    async run() {
        const {flags} = this.parse(ConfigList);
        const {config} = await this.readConfig();
        const table = new Table({
            head: ['Key', 'Value']
        }) as Table.HorizontalTable;
        for (const [k, v] of Object.entries(flat(config))) {
            table.push([chalk.yellowBright(k), v as string]);
        }
        console.log(table.toString());
    }
}
