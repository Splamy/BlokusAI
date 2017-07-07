class Pos implements IEquatable<Pos> {
    public static readonly Zero: Pos = new Pos(0, 0);

    constructor(public readonly x: number, public readonly y: number) { }

    public add(pos: Pos): Pos { return new Pos(this.x + pos.x, this.y + pos.y); }
    public sub(pos: Pos): Pos { return new Pos(this.x - pos.x, this.y - pos.y); }
    public subi(x: number, y: number): Pos { return new Pos(this.x - x, this.y - y); }
    public equals(pos: Pos): boolean { return this.x === pos.x && this.y === pos.y; }
    public addeq(pos: Pos, eq: Pos): boolean { return this.x + pos.x === eq.x && this.y + pos.y === eq.y; }
}
