class Corner {
    public constructor(
        public readonly pos: Pos,
        public readonly dir: CornerDir) { }

    public diagMatch(other: Corner): boolean {
        return (this.dir === CornerDir.TopLeft
            || this.dir === CornerDir.BotRight)
            === (other.dir === CornerDir.TopLeft
            || other.dir === CornerDir.BotRight);
    }
}
