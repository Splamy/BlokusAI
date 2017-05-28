/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="PlayerId.ts"/>

let previewVariant: number = 0;
let previewShape: Shape = null;
let gameState: GameState = null;
let viewGrid: ViewGrid = null;

window.onload = () => {
    Shape.initialize();
    viewGrid = new ViewGrid();
    viewGrid.hoverset = hoverSimple;

    const selectorDiv = document.getElementById("selector1");
    const selector = new ShapeSelector(PlayerId.p1);
    selectorDiv.appendChild(selector.generate());

    newGameFunc();
};

function newGame(this: HTMLElement, ev: Event): void { newGameFunc(); }

function newGameFunc(): void {
    const sizeSelector
        = document.getElementById("newGame_size") as HTMLInputElement;
    RuleSet.GridSize = parseInt(sizeSelector.value);

    gameState = GameState.start();
    reloadGlobalGrid();
    viewGrid.display(gameState);
}

function reloadGlobalGrid(): void {
    const grid = viewGrid.generate(RuleSet.GridSize);
    const game = document.getElementById("game");
    while (game.firstChild) {
        game.removeChild(game.firstChild);
    }
    game.appendChild(grid);
}

function hoverSimple(this: ViewGrid, pos: Pos): Pos[] {
    if (previewShape === null)
        return null;
    if (previewVariant < 0 || previewVariant >= previewShape.Variants.length)
        previewVariant = ((previewVariant % previewShape.Variants.length) +
            previewShape.Variants.length) % previewShape.Variants.length;

    const newPrev = Shape.at(pos, previewShape.Variants[previewVariant]);
    this.clearHover();
    this.setHover(newPrev, gameState.turn);
}