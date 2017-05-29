/**
 * Provides a comfortable way to register and invoke callbacks.
 */
class Ev<T extends Function> {
    private cbList: [object, T][];

    constructor() { this.cbList = []; }

    public register(thisObj: object, cb: T): void {
        this.cbList.push([thisObj, cb]);
    }

    public invoke(...args: any[]): void {
        for (var i = 0; i < this.cbList.length; i++) {
            let [thisObj, cb] = this.cbList[i];
            cb.call(thisObj, ...args);
        }
    }

    public isRegistered(): boolean { return this.cbList.length > 0; }
}