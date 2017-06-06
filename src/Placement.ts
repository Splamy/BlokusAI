class Placement implements IEquatable<Placement> {
    private posArr?: Pos[];

    constructor(
        public readonly pos: Pos,
        public readonly shape: Shape,
        public readonly variant: number) { }

    public getPosArr(): Pos[] {
        if (this.posArr === undefined)
            this.posArr = this.shape.at(this.pos, this.variant);
        return this.posArr;
    }

    public equals(other: Placement): boolean {
        return this.pos.equals(other.pos)
            && this.shape.Type === other.shape.Type
            && this.variant === other.variant;
    }
}
