class Util {

    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    private static readonly keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

    private static preventDefault(e: any): void {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    private static preventDefaultForScrollKeys(e: any): boolean {
        if (Util.keys[e.keyCode]) {
            Util.preventDefault(e);
            return false;
        }
    }

    public static disableScroll(): void {
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', Util.preventDefault, false);
        window.onwheel = Util.preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = Util.preventDefault; // older browsers, IE
        window.ontouchmove = Util.preventDefault; // mobile
        document.onkeydown = Util.preventDefaultForScrollKeys;
    }

    public static enableScroll(): void {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', Util.preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }
}