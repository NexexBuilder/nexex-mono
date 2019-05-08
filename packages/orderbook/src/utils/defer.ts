import Bluebird from 'bluebird';

export interface Defer<T> {
    resolve(res?: T): void;
    reject(err: any): void;
    promise: Promise<T>;
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
