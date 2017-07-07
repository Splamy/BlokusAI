/// <reference path="Pos.ts"/>

class Corner {
    private static offset = [new Pos(-1, -1), new Pos(1, -1), new Pos(1, 1), new Pos(-1, 1)];
    public readonly target: Pos;
    public constructor(
        public readonly pos: Pos,
        public readonly dir: CornerDir) {
        const off = Corner.offset[dir];
        this.target = new Pos(pos.x + off.x, pos.y + off.y);
    }

    public diagMatch(other: CornerDir): boolean {
        return (other as number + 2) % 4 === this.dir;
    }
}
