/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>

let previewShape: Shape = null;

window.onload = () => {
    Shape.initialize();
    ViewGrid.reloadGlobalGrid();
    ViewGrid.instance.hoverset = hoverSimple;

    const selectorDiv = document.getElementById("selector1");
    const selector = new ShapeSelector();
    selectorDiv.appendChild(selector.generate());

    //console.log(Shape.AllShapes);
};

function newGame(this: HTMLElement, ev: Event): void {
    const sizeSelector
        = document.getElementById("newGame_size") as HTMLInputElement;
    RuleSet.GridSize = parseInt(sizeSelector.value);
    ViewGrid.reloadGlobalGrid();
}

function hoverSimple(pos: Pos): Pos[] {
    if(previewShape === null)
        return null;
    const applyPos: Pos[] = [];
    return previewShape.at(pos);
}