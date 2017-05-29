/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="PlayerId.ts"/>

let viewGrid: ViewGrid = null;
let players: [IPlayer, IPlayer] = [null, null];
let p1Selector: ShapeSelector = null;

window.onload = () => {
    // generate color sheme for player 1 and 2
    Css.GenerateCustomStyle(0, 240);
    // precalculate data for all shapes
    Shape.initialize();
    // create view grid to display the game
    viewGrid = new ViewGrid();

    const selectorDiv = document.getElementById("selector1");
    p1Selector = new ShapeSelector(PlayerId.p1);
    selectorDiv.appendChild(p1Selector.generate());

    newGameFunc();
};

function newGame(this: HTMLElement, ev: Event): void { newGameFunc(); }

function placeCallback(pos: Pos, shape: Shape, variant: number): void {
    const state = viewGrid.currentState();
    const posArr = Shape.at(pos, shape.Variants[variant]);
    const newState = state.place(posArr, shape.Type);
    viewGrid.display(newState);
}

function newGameFunc(): void {
    const sizeSelector
        = document.getElementById("newGame_size") as HTMLInputElement;
    RuleSet.GridSize = parseInt(sizeSelector.value);

    const gameState = GameState.start();
    reloadGlobalGrid();
    viewGrid.display(gameState);

    for (let i = 0; i < 2; i++) {
        const brain = document.getElementById("newGame_player" + i) as HTMLInputElement;
        players[i] = selectionToClass(brain.value, p1Selector);
        players[i].placeCallback.register(null, placeCallback);
    }
}

function selectionToClass(selection: string, selector?: ShapeSelector): IPlayer {
    switch (selection) {
        case "0": return new Human(viewGrid, selector);
        case "1": return new RandomAi();
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