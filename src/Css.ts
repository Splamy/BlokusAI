class Css {
    private static readonly playerCssPrefix: string = "player"

    public static playerColor(player: PlayerId): string {
        return Css.playerCssPrefix + player;
    }

    public static clearPlayerColor(classList: DOMTokenList): void {
        classList.remove(Css.playerCssPrefix + PlayerId.p1);
        classList.remove(Css.playerCssPrefix + PlayerId.p2);
    }
}