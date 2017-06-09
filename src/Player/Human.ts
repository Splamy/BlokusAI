/// <reference path="../Enums/ShapeType.ts"/>
/// <reference path="../RuleSet.ts"/>

class Human implements IPlayer {
    public readonly placeCallback = new Ev<Placement>();
    public previewVariant: number = 0;
    public previewShape?: Shape;
    protected view: ViewGrid;
    private lastPos?: Placement;
    private selector: ShapeSelector;

    constructor(view: ViewGrid, s1: ShapeSelector) {
        this.view = view;
        this.selector = s1;
        view.cbHover.register(this, this.hoverAction); // tslint:disable-line no-unbound-method
        view.cbClick.register(this, this.clickAction); // tslint:disable-line no-unbound-method
        view.cbWheel.register(this, this.wheelAction); // tslint:disable-line no-unbound-method
        view.cbClear.register(this, this.clearAction); // tslint:disable-line no-unbound-method
        s1.shapeSelected.register(this, this.setPreviewShape); // tslint:disable-line no-unbound-method
    }

    public display(gameState: GameState): void { this.view.display(gameState); }

    public hoverAction(grid: ViewGrid, pos: Pos): void {
        if (this.previewShape === undefined)
            return;
        this.normalizeVariant();

        grid.clearHover();
        const gameState = grid.currentState();
        this.lastPos = new Placement(pos, this.previewShape, this.previewVariant);
        const hoverColor = gameState.canPlace(this.lastPos, true) ? gameState.turn : PlayerId.hover;
        grid.setHover(this.lastPos.getPosArr(), hoverColor);
    }

    public clickAction(grid: ViewGrid, pos: Pos): void {
        if (this.previewShape === undefined)
            return;
        this.normalizeVariant();

        if (this.placeCallback.isRegistered()) {
            const gameState = grid.currentState();
            if (this.lastPos === undefined)
                this.lastPos = new Placement(pos, this.previewShape, this.previewVariant);
            if (!gameState.canPlace(this.lastPos, true))
                return;
            this.placeCallback.invoke(this.lastPos);
            this.clearAction(grid);
        }
    }

    public wheelAction(grid: ViewGrid, varDiff: number): void {
        if (this.lastPos !== undefined) {
            this.previewVariant += varDiff;
            this.hoverAction(grid, this.lastPos.pos);
        }
    }

    public clearAction(grid: ViewGrid): void {
        this.lastPos = undefined;
        this.previewShape = undefined;
        Util.enableScroll();
    }

    private setPreviewShape(shape: Shape): void {
        const currentState = this.view.currentState();
        if (currentState.turn !== this.selector.player)
            return;
        this.previewShape = shape;
    }

    private normalizeVariant(): void {
        if (this.previewShape === undefined)
            return;
        if (this.previewVariant < 0 || this.previewVariant >= this.previewShape.Variants.length)
            this.previewVariant = ((this.previewVariant % this.previewShape.Variants.length) +
                this.previewShape.Variants.length) % this.previewShape.Variants.length;
    }
}
