class Corner {
    public constructor(
        public readonly pos: Pos,
        public readonly dir: CornerDir) { }

    public diagMatch(other: CornerDir): boolean {
        return (other as number + 2) % 4 === this.dir;
    }
}
