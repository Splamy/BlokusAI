class GameGrid implements IAction {
    public previewVariant: number = 0;
    public previewShape: Shape = null;
    private lastPos: Pos = Pos.Zero;

    placeCallback: (pos: Pos, shape: Shape, variant: number) => void = null;

    constructor(grid: ViewGrid, s1: ShapeSelector) {
        const game = this;
        viewGrid.cbHover = function (this: ViewGrid, pos: Pos) { game.hoverAction(grid, pos); };
        viewGrid.cbClick = function (this: ViewGrid, pos: Pos) { game.clickAction(grid, pos); };
        viewGrid.cbWheel = function (this: ViewGrid, diff: number) { game.wheelAction(grid, diff); };
        viewGrid.cbClear = function (this: ViewGrid) { game.clearAction(grid); };
        s1.shapeSelected = function (shape: Shape) { game.previewShape = shape; };
    }

    public hoverAction(grid: ViewGrid, pos: Pos): void {
        this.lastPos = pos;
        if (this.previewShape === null)
            return null;
        this.normalizeVariant();

        const newPrev = Shape.at(pos, this.previewShape.Variants[this.previewVariant]);
        grid.clearHover();
        grid.setHover(newPrev, gameState.turn);
    }

    public clickAction(grid: ViewGrid, pos: Pos): void {
        if (this.previewShape === null)
            return null;
        this.normalizeVariant();

        if (this.placeCallback !== null) {
            this.placeCallback(pos, this.previewShape, this.previewVariant);
            this.clearAction(grid);
        }
    }

    public wheelAction(grid: ViewGrid, varDiff: number): void {
        this.previewVariant += varDiff;
        this.hoverAction(grid, this.lastPos);
    }

    public clearAction(grid: ViewGrid): void {
        this.previewShape = null;
        Util.enableScroll();
    }

    private normalizeVariant(): void {
        if (this.previewVariant < 0 || this.previewVariant >= this.previewShape.Variants.length)
            this.previewVariant = ((this.previewVariant % this.previewShape.Variants.length) +
                this.previewShape.Variants.length) % this.previewShape.Variants.length;
    }
}