class Pos {
    public static readonly Zero: Pos = new Pos(0, 0);

    constructor(public readonly x: number, public readonly y: number) { }

    public sub(pos: Pos): Pos { return new Pos(this.x - pos.x, this.y - pos.y); }
    public subi(x: number, y: number): Pos { return new Pos(this.x - x, this.y - y); }
}
