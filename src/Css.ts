class Css {
    public static applyPlayerColor(classList: DOMTokenList, player: PlayerId): void {
        classList.remove(
            Css.playerColor("", PlayerId.p1),
            Css.playerColor("", PlayerId.p2),
            Css.playerColor("", PlayerId.hover));
        if (player !== PlayerId.none)
            classList.add(Css.playerColor("", player));
    }

    public static applyPlayerHighlight(classList: DOMTokenList, player?: PlayerId): void {
        classList.remove(
            Css.playerColor("start", PlayerId.p1),
            Css.playerColor("start", PlayerId.p2),
            Css.playerColor("start", PlayerId.hover));
        if (player !== undefined)
            classList.add(Css.playerColor("start", player));
    }

    public static GenerateCustomStyle(hue1: number, hue2: number) {
        if (Css.styleElem === undefined) {
            Css.styleElem = document.createElement("style");
            Css.styleElem.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(Css.styleElem);
        }
        const style =
            Css.generateColorScheme(PlayerId.hover, 0, [0, 0, 0, 0, 0]) +
            Css.generateColorScheme(PlayerId.p1, hue1) +
            Css.generateColorScheme(PlayerId.p2, hue2);
        Css.styleElem.innerHTML = style;
    }

    private static readonly playerCssPrefix: string = "player";
    private static styleElem?: HTMLStyleElement;
    private static readonly defaultSat: [number, number, number, number, number] = [86, 100, 100, 23, 9];
    private static readonly cache: any = {};

    private static playerColor(css: string, player: PlayerId): string {
        let cacheArr = Css.cache[css];
        if (cacheArr === undefined)
            Css.cache[css] = cacheArr = [];
        let cacheVal = cacheArr[player];
        if (cacheVal === undefined)
            cacheArr[player] = cacheVal = Css.playerCssPrefix + String(player as number + 1) + css;
        return cacheVal;
    }

    private static generateColorScheme(player: PlayerId, hue: number, sat = Css.defaultSat): string {
        const pname = Css.playerColor("", player);
        const pnamestart = Css.playerColor("start", player);
        return `.${pname}::before { background: hsl(${hue}, ${sat[0]}%, 50%); position: absolute; } `
            + `.${pname} { background: linear-gradient(to bottom right, `
            + `hsl(${hue}, ${sat[1]}%, 78%) 0%, hsl(${hue}, ${sat[2]}%, 65%) 50%, `
            + `hsl(${hue}, ${sat[3]}%, 33%) 51%, hsl(${hue}, ${sat[4]}%, 16%) 100%); position: relative; }`
            + `.${pnamestart} { box-shadow: inset 0px 0px 10px 5px hsl(${hue}, ${sat[0]}%, 50%); }`;
    }
}
