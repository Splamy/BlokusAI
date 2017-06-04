class Util {
    public static rndInt(min: number, max: number): number {
        if (min > max)
            throw new Error("min must be less then max");
        return Math.floor(Math.random() * (max - min) + min);
    }

    public static pickRnd<T>(arr: T[]): T {
        return arr[Util.rndInt(0, arr.length)];
    }

    public static otherPlayer(player: PlayerId) {
        if (player === PlayerId.none)
            throw new Error("Cannon switch none player");
        return player === PlayerId.p1 ? PlayerId.p2 : PlayerId.p1;
    }

    public static clearChildren(element: HTMLElement): void {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    public static clearArray(arr: object[]): void {
        arr.length = 0;
    }

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
        window.onmousewheel = document.onmousewheel = null!;
        window.onwheel = null!;
        window.ontouchmove = null!;
    }

    private static preventDefault(e: any): void {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }
}
