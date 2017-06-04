class Placement {
    private posArr: Pos[] | null = null;

    constructor(
        public readonly pos: Pos,
        public readonly shape: Shape,
        public readonly variant: number) { }

    public getPosArr(): Pos[] {
        if (this.posArr === null)
            this.posArr = Shape.at(this.pos, this.shape.Variants[this.variant]);
        return this.posArr;
    }
}
