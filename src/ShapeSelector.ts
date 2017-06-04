interface IShapeSelector {
    selector?: ShapeSelector;
    shapeId: number;
}

class ShapeSelector {
    private static ShapeClick(this: HTMLElement, ev: MouseEvent): void {
        const shapeSelector: IShapeSelector = this as any;
        if (shapeSelector.selector === undefined)
            return;
        const cb = shapeSelector.selector.shapeSelected;
        if (cb.isRegistered()) {
            const selectedShape = Shape.AllShapes[shapeSelector.shapeId];
            cb.invoke(selectedShape);
        }
        Util.disableScroll();
    }

    public readonly shapeSelected = new Ev<Shape>();
    private selectorBox?: HTMLElement;
    private shapes: HTMLElement[] = [];

    constructor(public player: PlayerId) { }

    public generate(force: boolean = false): HTMLElement {
        if (!force && this.selectorBox !== undefined) {
            return this.selectorBox;
        } else if (this.selectorBox === undefined) {
            this.selectorBox = document.createElement("div");
            this.selectorBox.classList.add("grid");
        } else {
            Util.clearArray(this.shapes);
            Util.clearChildren(this.selectorBox);
        }

        for (let i = 0; i < Shape.ShapeCount; i++) {
            const shape = Shape.AllShapes[i];
            const shapeGrid = new ViewGrid();
            const displayVariant = 0;
            const shapeGridDiv = shapeGrid.generate(
                shape.Variants[displayVariant].Form[0].length,
                shape.Variants[displayVariant].Form.length);
            shapeGrid.setHover(shape.at(Pos.Zero, displayVariant), this.player);
            const anyShapeGridDiv: IShapeSelector = shapeGridDiv as any;
            anyShapeGridDiv.shapeId = i;
            anyShapeGridDiv.selector = this;
            this.shapes[i] = shapeGridDiv;
            this.selectorBox.appendChild(shapeGridDiv);
            shapeGridDiv.onclick = ShapeSelector.ShapeClick;
            shapeGridDiv.classList.add("gridelem");
        }

        return this.selectorBox;
    }
}
