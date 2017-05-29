/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="PlayerId.ts"/>

let gameState: GameState = null;
let viewGrid: ViewGrid = null;
let gameGrid: GameGrid = null;
let players: [IPlayer, IPlayer] = [null, null];

window.onload = () => {
    Css.GenerateCustomStyle(0, 240);
    Shape.initialize();
    viewGrid = new ViewGrid();

    const selectorDiv = document.getElementById("selector1");
    const selector = new ShapeSelector(PlayerId.p1);
    selectorDiv.appendChild(selector.generate());

    gameGrid = new GameGrid(viewGrid, selector);

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

    for (let i = 0; i < 2; i++) {
        const brain = document.getElementById("newGame_player" + i) as HTMLInputElement;
        players[i] = selectionToClass(brain.value);
    }
}

function selectionToClass(selection: string): IPlayer {
    switch (selection) {
        case "0": return new Human(viewGrid, gameGrid);
        //case 1: return new RandomAI(viewGrid, viewGrid);
        //case 2: return new EasyAI(viewGrid, viewGrid);
    }
}

function reloadGlobalGrid(): void {
    const grid = viewGrid.generate(RuleSet.GridSize);
    const game = document.getElementById("game");
    while (game.firstChild) {
        game.removeChild(game.firstChild);
    }
    game.appendChild(grid);
}