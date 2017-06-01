/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="Timer.ts"/>
/// <reference path="ShapeSelector.ts"/>
/// <reference path="Enums/PlayerId.ts"/>
/// <reference path="Player/IPlayer.ts"/>

let viewGrid: ViewGrid = new ViewGrid();
let players: [IPlayer, IPlayer] = [Dummy.Instance, Dummy.Instance];
let selectors: [ShapeSelector | null, ShapeSelector | null] = [null, null];
let isDisplayCallback: boolean = false;
let aiProcessedDisplay: boolean = false;
let autoTimer: Timer = new Timer(autoPlayLoop, 1);

window.onload = () => {
    // generate color sheme for player 1 and 2
    Css.GenerateCustomStyle(0, 240);
    // precalculate data for all shapes
    Shape.initialize();
    // create view grid to display the game

    for (let i = 0; i < 2; i++) {
        const selectorDiv = document.getElementById("selector" + i);
        if (selectorDiv === null)
            throw new Error("html site missing element");
        const selector = new ShapeSelector(i);
        selectors[i] = selector;
        selectorDiv.appendChild(selector.generate());
    }

    // newGameFunc();
};

function newGame(this: HTMLElement, ev: Event): void { newGameFunc(); }

function autoPlayLoop(): void {
    const gameState = viewGrid.currentState();

    isDisplayCallback = true;
    players[gameState.turn].display(gameState);
    isDisplayCallback = false;
    const aiProcDisp = aiProcessedDisplay;
    aiProcessedDisplay = false;
    if (!aiProcDisp)
        autoTimer.stop();
}

function placeCallback(placement: Placement): void {
    const state = viewGrid.currentState();
    const newState = state.place(placement);
    // update our grahical view
    viewGrid.clearHover();
    viewGrid.display(newState);
    // notify other player about turn
    if (isDisplayCallback) {
        aiProcessedDisplay = true;
    } else {
        autoTimer.start();
    }
}

function newGameFunc(): void {
    const sizeSelector
        = document.getElementById("newGame_size") as HTMLInputElement;
    RuleSet.GridSize = parseInt(sizeSelector.value, 10);

    viewGrid.cbClear.clear();
    viewGrid.cbClick.clear();
    viewGrid.cbHover.clear();
    viewGrid.cbWheel.clear();

    for (let i = 0; i < 2; i++) {
        players[i].placeCallback.clear();
        const brain = document.getElementById("newGame_player" + i) as HTMLInputElement;
        const selector = selectors[i]!;
        selector.shapeSelected.clear();
        players[i] = selectionToClass(brain.value, selector);
        players[i].placeCallback.register(null, placeCallback);
    }

    const gameState = GameState.start();
    reloadGlobalGrid();
    viewGrid.display(gameState);

    // players[PlayerId.p1].display(gameState);
    autoTimer.start();
}

function selectionToClass(selection: string, selector?: ShapeSelector): IPlayer {
    switch (selection) {
        case "0":
            if (selector === undefined)
                throw new Error("selector must be passed for human player");
            return new Human(viewGrid, selector);
        case "1": return new RandomAi();
        // case 2: return new EasyAI(viewGrid, viewGrid);
        default: throw new Error("unhandled player type");
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
