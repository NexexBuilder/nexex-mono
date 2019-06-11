import {Deserialize, INewable, ISerializable, Serialize} from 'cerialize';
import * as R from 'ramda';

export const serializePartial = <I, O>(type?: Function | ISerializable) =>
    R.partialRight<I, Function | ISerializable, O>(Serialize, [type]);

export const deserializePartial = <I, O>(type?: Function | INewable<any> | ISerializable) =>
    R.partialRight<I, Function | INewable<any> | ISerializable, O>(Deserialize, [type]);
