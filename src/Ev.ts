/**
 * Provides a comfortable way to register and invoke callbacks.
 */
class Ev<T1 = undefined, T2 = undefined, T3 = undefined> {

    private cbList: Array<[object | null, Function]>;

    constructor() { this.cbList = []; }

    public register(thisObj: object | null, cb:
        ((a: T1) => void) |
        ((a: T1, b: T2) => void) |
        ((a: T1, b: T2, c: T3) => void)): void {
        this.cbList.push([thisObj, cb]);
    }

    public invoke(a?: T1, b?: T2, c?: T3): void {
        for (const [thisObj, cb] of this.cbList) {
            cb.call(thisObj, a, b, c);
        }
    }

    public isRegistered(): boolean { return this.cbList.length > 0; }
}