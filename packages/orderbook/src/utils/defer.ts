import Bluebird from 'bluebird';

export interface Defer<T> {
    promise: Promise<T>;
    resolve(res?: T): void;
    reject(err: any): void;
}

export function defer<T>(): Defer<T> {
    let resolve, reject;
    const promise = new Bluebird((resolveFn, rejectFn) => {
        resolve = resolveFn;
        reject = rejectFn;
    });
    return {
        resolve,
        reject,
        promise: promise as any
    };
}
