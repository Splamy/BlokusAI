class Util {
    public static rndInt(min: number, max: number): number {
        if (min > max)
            throw new Error("min must be less then max");
        return Math.floor(Math.random() * (max - min) + min);
    }

    public static pickRnd<T>(arr: T[]): T | undefined {
        if (arr.length === 0)
            return undefined;
        return arr[Util.rndInt(0, arr.length)];
    }

    public static otherPlayer(player: PlayerId): PlayerId.p1 | PlayerId.p2 {
        if (player === PlayerId.none)
            throw new Error("Cannon switch none player");
        return player === PlayerId.p1 ? PlayerId.p2 : PlayerId.p1;
    }

    public static clearChildren(element: HTMLElement): void {
        while (element.firstChild !== null) { // tslint:disable-line no-null-keyword
            element.removeChild(element.firstChild);
        }
    }

    public static clearArray(arr: { length: number }): void {
        arr.length = 0;
    }

    public static getElementByIdSafe(elementId: string): HTMLElement {
        return Util.safeElement(document.getElementById(elementId));
    }

    public static safeElement<T>(elem: T | null): T {
        if (elem === null) // tslint:disable-line no-null-keyword
            throw new Error("Missing html element");
        return elem;
    }

    public static fairSplit(full: number, me: number, max: number): { Start: number, Length: number } {
        if (me < full % max) {
            const len = full / max + 1;
            return { Length: len, Start: len * me };
        } else {
            const len = full / max;
            return { Length: len, Start: length * me + full % max };
        }
    }

    /* tslint:disable */
    public static disableScroll(): void {
        if (window.addEventListener) // older FF
            window.addEventListener("DOMMouseScroll", Util.preventDefault, false);
        window.onwheel = Util.preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = Util.preventDefault; // older browsers, IE
        window.ontouchmove = Util.preventDefault; // mobile
    }

    public static enableScroll(): void {
        if (window.removeEventListener)
            window.removeEventListener("DOMMouseScroll", Util.preventDefault, false);
        window.onmousewheel = document.onmousewheel = undefined!;
        window.onwheel = undefined!;
        window.ontouchmove = undefined!;
    }

    private static preventDefault(e: any): void {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }
    /* tslint:enable */
}
