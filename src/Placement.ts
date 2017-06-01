class Placement {
    private posArr: Pos[] | null = null;

    constructor(public pos: Pos, public shape: Shape, public variant: number) { }

    public getPosArr(): Pos[] {
        if (this.posArr === null)
            this.posArr = Shape.at(this.pos, this.shape.Variants[this.variant]);
        return this.posArr;
    }
}