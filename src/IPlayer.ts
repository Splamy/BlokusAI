/// <reference path="ShapeType.ts"/>
/// <reference path="RuleSet.ts"/>

interface IPlayer extends IView, IAction { }

class Human implements IPlayer {
    public readonly placeCallback = new Ev<(pos: Pos, shape: Shape, variant: number) => void>();
    public previewVariant: number = 0;
    public previewShape: Shape = null;
    private lastPos: Pos = Pos.Zero;
    protected view: ViewGrid;

    constructor(view: ViewGrid, s1: ShapeSelector) {
        this.view = view;
        viewGrid.cbHover.register(this, this.hoverAction);
        viewGrid.cbClick.register(this, this.clickAction);
        viewGrid.cbWheel.register(this, this.wheelAction);
        viewGrid.cbClear.register(this, this.clearAction);
        s1.shapeSelected.register(this, this.setPreviewShape);
    }

    public hoverAction(grid: ViewGrid, pos: Pos): void {
        this.lastPos = pos;
        if (this.previewShape === null)
            return null;
        this.normalizeVariant();

        const newPrev = Shape.at(pos, this.previewShape.Variants[this.previewVariant]);
        grid.clearHover();
        const gameState = grid.currentState();
        grid.setHover(newPrev, gameState.turn);
    }

    public clickAction(grid: ViewGrid, pos: Pos): void {
        if (this.previewShape === null)
            return null;
        this.normalizeVariant();

        if (this.placeCallback.isRegistered()) {
            this.placeCallback.invoke(pos, this.previewShape, this.previewVariant);
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

    private setPreviewShape(shape: Shape): void {
        this.previewShape = shape;
    }

    private normalizeVariant(): void {
        if (this.previewVariant < 0 || this.previewVariant >= this.previewShape.Variants.length)
            this.previewVariant = ((this.previewVariant % this.previewShape.Variants.length) +
                this.previewShape.Variants.length) % this.previewShape.Variants.length;
    }

    display(gameState: GameState): void { this.view.display(gameState); }
    currentState(): GameState { return this.view.currentState(); }
}

class RandomAi implements IPlayer {
    private gameState: GameState;
    public readonly placeCallback = new Ev<(pos: Pos, shape: Shape, variant: number) => void>();

    display(gameState: GameState): void {
        this.gameState = gameState;
        this.placeCallback.invoke(null, null, 0);
    }
    currentState(): GameState { return this.gameState; }
}