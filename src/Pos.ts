class Pos {
    public static readonly Zero: Pos = new Pos(0, 0);

    constructor(public readonly x: number, public readonly y: number) {
        this.x = x; this.y = y;
    }
}
