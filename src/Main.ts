/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>

window.onload = () => {
    Shape.initialize();
    ViewGrid.reloadGlobalGrid();
    ViewGrid.instance.hoverset = hoverSimple;

    console.log(Shape.AllShapes);
};

function newGame(this: HTMLElement, ev: Event): void {
    const sizeSelector
        = document.getElementById("newGame_size") as HTMLInputElement;
    RuleSet.GridSize = parseInt(sizeSelector.value);
    ViewGrid.reloadGlobalGrid();
}

function hoverSimple(pos: Pos): Pos[] {
    const applyPos: Pos[] = [];
    const shape = Shape.W.Form;
    for (let y = 0; y < shape.length; y++) {
        var row = shape[y];
        for (let x = 0; x < row.length; x++) {
            if (row[x]) {
                applyPos.push(new Pos(pos.x + x, pos.y + y));
            }
        }
    }
    return applyPos;
}