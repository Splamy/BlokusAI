/// <reference path="Pos.ts"/>

class Corner {
    private static offset = [new Pos(-1, -1), new Pos(1, -1), new Pos(1, 1), new Pos(-1, 1)];
    public constructor(
        public readonly pos: Pos,
        public readonly dir: CornerDir) { }

    public diagMatch(other: CornerDir): boolean {
        return (other as number + 2) % 4 === this.dir;
    }

    public toPlace(): Pos {
        const off = Corner.offset[this.dir];
        return new Pos(this.pos.x + off.x, this.pos.y + off.y);
    }

    public toPlaceSub(sub: Pos): Pos {
        const off = Corner.offset[this.dir];
        return new Pos(this.pos.x - sub.x + off.x, this.pos.y - sub.y + off.y);
    }

    public toPlaceAdd(add: Pos): Pos {
        const off = Corner.offset[this.dir];
        return new Pos(this.pos.x + add.x + off.x, this.pos.y + add.y + off.y);
    }
}
