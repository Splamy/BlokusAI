class Pos {
    public readonly x: number;
    public readonly y: number;

    public static readonly Zero: Pos = new Pos(0, 0);

    constructor(x: number, y: number) {
        this.x = x; this.y = y;
    }
}