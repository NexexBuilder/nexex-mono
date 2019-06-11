import Bluebird from 'bluebird';

/**
 * A local cache util
 * support loader so if a cache expires, will still return cached value until loader update the cache.
 */
export class LocalCache {
    private cacheMap: Map<string, any> = new Map<string, any>();
    private timeoutMap: Map<string, any> = new Map<string, any>();

    put(key: string, value: any, expires: number = 0, loader?: () => any): void {
        this.cacheMap.set(key, value);
        if (expires > 0) {
            const tout = this.timeoutMap.get(key);
            if (tout) {
                clearTimeout(tout);
            }
            if (loader) {
                this.timeoutMap.set(
                    key,
                    setTimeout(async () => {
                        try {
                            const fetchRes = await Bluebird.try(loader);
                            this.put(key, fetchRes, expires, loader);
                        } catch (e) {
                            this.cacheMap.delete(key);
                        }
                    }, expires)
                );
            } else {
                this.timeoutMap.set(
                    key,
                    setTimeout(async () => {
                        this.cacheMap.delete(key);
                    }, expires)
                );
            }
        }
    }

    remove(key: string): void {
        const tout = this.timeoutMap.get(key);
        if (tout) {
            clearTimeout(tout);
        }
        this.cacheMap.delete(key);
    }

    get(key: string): any {
        return this.cacheMap.get(key);
    }
}
