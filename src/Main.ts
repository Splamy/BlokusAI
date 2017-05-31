/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="ShapeSelector.ts"/>
/// <reference path="Enums/PlayerId.ts"/>
/// <reference path="Player/IPlayer.ts"/>

let viewGrid: ViewGrid = new ViewGrid();
let players: [IPlayer, IPlayer] = [Dummy.Instance, Dummy.Instance];
let p1Selector: ShapeSelector = new ShapeSelector(PlayerId.p1);

window.onload = () => {
    // generate color sheme for player 1 and 2
    Css.GenerateCustomStyle(0, 240);
    // precalculate data for all shapes
    Shape.initialize();
    // create view grid to display the game

    const selectorDiv = document.getElementById("selector1");
    if (selectorDiv === null)
        throw new Error("html site missing element");
    selectorDiv.appendChild(p1Selector.generate());

    // newGameFunc();
};

function newGame(this: HTMLElement, ev: Event): void { newGameFunc(); }

function autoPlayLoop(): void {
    // TODO
}

function placeCallback(pos: Pos, shape: Shape, variant: number): void {
    const state = viewGrid.currentState();
    const posArr = Shape.at(pos, shape.Variants[variant]);
    const newState = state.place(posArr, shape.Type);
    // update our grahical view
    viewGrid.display(newState);
    // notify other player about turn
    players[newState.turn].display(newState);
}

function newGameFunc(): void {
    const sizeSelector
        = document.getElementById("newGame_size") as HTMLInputElement;
    RuleSet.GridSize = parseInt(sizeSelector.value, 10);

    const gameState = GameState.start();
    reloadGlobalGrid();
    viewGrid.display(gameState);

    for (let i = 0; i < 2; i++) {
        const brain = document.getElementById("newGame_player" + i) as HTMLInputElement;
        players[i] = selectionToClass(brain.value, p1Selector);
        players[i].placeCallback.register(null, placeCallback);
    }

    players[PlayerId.p1].display(gameState);
}

function selectionToClass(selection: string, selector?: ShapeSelector): IPlayer {
    switch (selection) {
        case "0":
            if (selector === undefined)
                throw new Error();
            return new Human(viewGrid, selector);
        case "1": return new RandomAi();
        // case 2: return new EasyAI(viewGrid, viewGrid);
        default: throw new Error();
    }
}

function reloadGlobalGrid(): void {
    const grid = viewGrid.generate(RuleSet.GridSize);
    const game = document.getElementById("game");
    if (game === null)
        throw new Error("html site missing element");
    Util.clearChildren(game);
    game.appendChild(grid);
}
