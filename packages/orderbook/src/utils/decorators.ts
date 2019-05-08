/* class decorator */
import {LocalCache} from '../utils/LocalCache';

const cacheMap: Map<string, {cacheData: LocalCache; isPromise: boolean}> = new Map();

function keyGen(args: any[] = []): string {
    try {
        let argsStr = '';
        for (const arg of args) {
            if (typeof arg === 'string' || typeof arg === 'number' || String(arg) !== '[object Object]') {
                argsStr += String(arg);
            } else {
                throw new Error();
            }
        }

        return argsStr;
    } catch (e) {
        throw new Error('invalid params');
    }
}

function getLocalCache(target: any, name: string, args: any[], isPromise: boolean): LocalCache {
    let cacheObj = cacheMap.get(`${target.constructor.name}#${name}`);
    if (!cacheObj) {
        cacheObj = {cacheData: new LocalCache(), isPromise};
        cacheMap.set(`${target.constructor.name}#${name}`, cacheObj);
    }

    return cacheObj.cacheData;
}

function testPromise(e: any): boolean {
    return !!e && typeof e.then === 'function';
}

export function localCache(expire: number): any {
    return (target: any, name: string, descriptor: PropertyDescriptor): void => {
        if (!!descriptor && typeof descriptor.value === 'function') {
            const orig = descriptor.value;
            // tslint:disable no-function-expression no-invalid-this
            descriptor.value = function(...args: any[]): any {
                const cacheObj = cacheMap.get(`${target.constructor.name}#${name}`);
                const key = keyGen(args);
                if (cacheObj) {
                    const {cacheData, isPromise} = cacheMap.get(`${target.constructor.name}#${name}`);
                    const cached = cacheData.get(key);
                    if (cached) {
                        if (isPromise) {
                            return Promise.resolve(cached);
                        } else {
                            return cached;
                        }
                    }
                }
                const res = orig.bind(this)(...args);
                if (testPromise(res)) {
                    res.then((futureRes: any) => {
                        if (futureRes) {
                            getLocalCache(target, name, args, true).put(key, futureRes, expire, () => {
                                return orig.bind(this)(...args);
                            });
                        }

                        return futureRes;
                    });
                } else {
                    getLocalCache(target, name, args, false).put(key, res, expire, () => {
                        return orig.bind(this)(...args);
                    });
                }

                return res;
            };

            descriptor.value.clear = (...args: any[]): void => {
                const cacheObj = cacheMap.get(`${target.constructor.name}#${name}`);
                const key = keyGen(args);
                if (cacheObj) {
                    const {cacheData} = cacheMap.get(`${target.constructor.name}#${name}`);
                    cacheData.remove(key);
                }
            };
        }
    };
}
