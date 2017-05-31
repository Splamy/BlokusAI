type EvCall<T1, T2, T3> =
    ((a: T1) => void) |
    ((a: T1, b: T2) => void) |
    ((a: T1, b: T2, c: T3) => void);

/**
 * Provides a comfortable way to register and invoke callbacks.
 */
class Ev<T1 = never, T2 = never, T3 = never> {

    private cbList: Array<[object | null, EvCall<T1, T2, T3>]>;

    constructor() { this.cbList = []; }

    public register(thisObj: object | null, cb: EvCall<T1, T2, T3>): void {
        this.cbList.push([thisObj, cb]);
    }

    public invoke(a?: T1, b?: T2, c?: T3): void {
        for (const [thisObj, cb] of this.cbList) {
            cb.call(thisObj, a, b, c);
        }
    }

    public isRegistered(): boolean { return this.cbList.length > 0; }
}
