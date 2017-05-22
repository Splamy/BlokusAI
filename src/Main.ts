/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>

window.onload = () => {
    Shape.initialize();
    ViewGrid.reloadGlobalGrid();

    console.log(Shape.AllShapes);
};

function newGame(this: HTMLElement, ev: Event): void {
    const sizeSelector
        = document.getElementById("newGame_size") as HTMLInputElement;
    RuleSet.GridSize = parseInt(sizeSelector.value);
    ViewGrid.reloadGlobalGrid();
}
