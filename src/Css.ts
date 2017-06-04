class Css {
    public static playerColor(player: PlayerId): string {
        return Css.playerCssPrefix + String(player + 1);
    }

    public static clearPlayerColor(classList: DOMTokenList): void {
        classList.remove(Css.playerColor(PlayerId.p1));
        classList.remove(Css.playerColor(PlayerId.p2));
    }

    public static generateColorScheme(hue: number): string {
        return `background: linear-gradient(to bottom right, `
            + `hsl(${hue}, 100%, 78%) 0%, hsl(${hue}, 100%, 65%) 50%, `
            + `hsl(${hue}, 23%, 33%) 51%, hsl(${hue}, 9%, 16%) 100%);`;
    }

    public static GenerateCustomStyle(hue1: number, hue2: number) {
        if (Css.styleElem === undefined) {
            Css.styleElem = document.createElement("style");
            Css.styleElem.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(Css.styleElem);
        }
        const p1 = Css.playerColor(PlayerId.p1);
        const p2 = Css.playerColor(PlayerId.p2);
        let style = `.${p1} { ${Css.generateColorScheme(hue1)} } .${p2} { ${Css.generateColorScheme(hue2)} } `;
        style += `.${p1}::before { background:hsl(${hue1}, 86%, 50%); } `
            + `.${p2}::before { background:hsl(${hue2}, 86%, 50%); } }`;
        Css.styleElem.innerHTML = style;
    }

    private static readonly playerCssPrefix: string = "player";
    private static styleElem?: HTMLStyleElement;
}
