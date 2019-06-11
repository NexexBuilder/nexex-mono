import {Deserialize, Serialize} from 'cerialize';
import idbKeyVal from 'idb-keyval';
import update from 'immutability-helper';
import {FtOrderTpl} from '../utils/tpl';

const selfFn = (state) => state;

const idb = function idb(store) {
    return {
        async load() {
            return reviver(await idbKeyVal.get(store));
        },

        save(states) {
            return idbKeyVal.set(store, replacer(states));
        }
    };
};

function replacer(states) {
    return update(states, {
        user: {
            orders: {
                $set: Serialize(states.user.orders, FtOrderTpl)
            }
        }
    });
}

function reviver(states) {
    return update(states, {
        user: {
            orders: {
                $set: Deserialize((states.user || {}).orders || [], FtOrderTpl)
            }
        }
    });
}

export default idb;
