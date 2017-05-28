interface IShapeSelector {
    shapeId: number;
}

class ShapeSelector {
    private selectorBox: HTMLElement;
    private shapes: HTMLElement[];
    private player: PlayerId;

    constructor(player: PlayerId) {
        this.player = player;
    }

    public generate(): HTMLElement {
        this.shapes = [];
        this.selectorBox = document.createElement("div");
        this.selectorBox.classList.add("grid")

        for (let i = 0; i < RuleSet.ShapeCount; i++) {
            const shape = Shape.AllShapes[i];
            const shapeGrid = new ViewGrid();
            const shapeGridDiv = shapeGrid.generate(shape.Form[0].length, shape.Form.length);
            shapeGrid.setHover(Shape.at(Pos.Zero, Shape.AllShapes[i].Form), this.player);
            const anyShapeGridDiv: IShapeSelector = shapeGridDiv as any;
            anyShapeGridDiv.shapeId = i;
            this.shapes[i] = shapeGridDiv;
            this.selectorBox.appendChild(shapeGridDiv);
            shapeGridDiv.onclick = ShapeSelector.ShapeClick;
            shapeGridDiv.classList.add("gridelem");
        }

        return this.selectorBox;
    }

    private static ShapeClick(this: HTMLElement, ev: MouseEvent): void {
        const shapeSelector = (<any>this) as IShapeSelector;
        if (shapeSelector === undefined)
            return;
        const selectedShape = Shape.AllShapes[shapeSelector.shapeId];
        if (previewShape === selectedShape) {
            previewShape = null;
            Util.enableScroll();
            return;
        }
        previewShape = selectedShape;
        Util.disableScroll();
    }
}