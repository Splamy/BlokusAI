interface IShapeSelector {
    shapeId: number;
}

class ShapeSelector {
    private selectorBox: HTMLElement;
    private shapes: HTMLElement[];

    public generate(): HTMLElement {
        this.shapes = [];
        this.selectorBox = document.createElement("div");
        this.selectorBox.classList.add("grid")

        for (let i = 0; i < RuleSet.ShapeCount; i++) {
            const shape = Shape.AllShapes[i];
            const shapeGrid = new ViewGrid();
            const shapeGridDiv = shapeGrid.generate(shape.Form[0].length, shape.Form.length);
            shapeGrid.setHover(Shape.AllShapes[i].at(Pos.Zero));
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
        previewShape = Shape.AllShapes[shapeSelector.shapeId];
    }
}