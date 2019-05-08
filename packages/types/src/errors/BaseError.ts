export abstract class BaseError extends Error {
    public stack: string;
    public message: string;
    public abstract name: string;
    public origin: Error;
    public __proto__: any;

    protected constructor(msg: string, throwable?: Error) {
        super(msg);
        this.origin = throwable;

        const actualProto = new.target.prototype;

        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            this.__proto__ = actualProto;
        }
    }
}
