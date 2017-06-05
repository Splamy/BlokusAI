/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="Timer.ts"/>
/// <reference path="ShapeSelector.ts"/>
/// <reference path="Enums/PlayerId.ts"/>
/// <reference path="Player/IPlayer.ts"/>
/// <reference path="Player/Dummy.ts"/>

class Main {
    public static init(): void {
        // generate color sheme for player 1 and 2
        Css.GenerateCustomStyle(0, 240);

        for (let i = 0; i < 2; i++) {
            const selectorDiv = document.getElementById("selector" + String(i));
            if (selectorDiv === null) // tslint:disable-line no-null-keyword
                throw new Error("html site missing element");
            const selector = new ShapeSelector(i);
            Main.selectors[i] = selector;
            selectorDiv.appendChild(selector.generate());
        }
    }
    public static newGameFunc(): void {
        const sizeSelector
            = document.getElementById("newGame_size") as HTMLInputElement;
        RuleSet.GridSize = parseInt(sizeSelector.value, 10);

        Main.viewGrid.cbClear.clear();
        Main.viewGrid.cbClick.clear();
        Main.viewGrid.cbHover.clear();
        Main.viewGrid.cbWheel.clear();

        for (let i = 0; i < 2; i++) {
            Main.players[i].placeCallback.clear();
            const brain = document.getElementById("newGame_player" + String(i)) as HTMLInputElement;
            const selector = Main.selectors[i]!;
            selector.shapeSelected.clear();
            Main.players[i] = Main.selectionToClass(brain.value, selector);
            Main.players[i].placeCallback.register(null, Main.placeCallback); // tslint:disable-line no-null-keyword
        }

        const gameState = GameState.start();
        Main.reloadGlobalGrid();
        Main.viewGrid.display(gameState);

        // players[PlayerId.p1].display(gameState);
        Main.autoTimer.start();
    }

    private static readonly viewGrid: ViewGrid = new ViewGrid();
    private static readonly players: [IPlayer, IPlayer] = [Dummy.Instance, Dummy.Instance];
    private static readonly selectors: [ShapeSelector | undefined, ShapeSelector | undefined] = [undefined, undefined];
    private static isDisplayCallback: boolean = false;
    private static aiProcessedDisplay: boolean = false;
    private static readonly autoTimer: Timer = new Timer(Main.autoPlayLoop, 1);

    private static autoPlayLoop(): void {
        const gameState = Main.viewGrid.currentState();

        Main.isDisplayCallback = true;
        Main.players[gameState.turn].display(gameState);
        Main.isDisplayCallback = false;
        const aiProcDisp = Main.aiProcessedDisplay;
        Main.aiProcessedDisplay = false;
        if (!aiProcDisp)
            Main.autoTimer.stop();
    }

    private static placeCallback(placement: Placement): void {
        const state = Main.viewGrid.currentState();
        const newState = state.place(placement);
        // update our grahical view
        Main.viewGrid.clearHover();
        Main.viewGrid.display(newState);
        // notify other player about turn
        if (Main.isDisplayCallback) {
            Main.aiProcessedDisplay = true;
        } else {
            Main.autoTimer.start();
        }
    }

    private static selectionToClass(selection: string, selector?: ShapeSelector): IPlayer {
        switch (selection) {
            case "0":
                if (selector === undefined)
                    throw new Error("selector must be passed for human player");
                return new Human(Main.viewGrid, selector);
            case "1": return new RandomAi();
            // case 2: return new EasyAI(viewGrid, viewGrid);
            default: throw new Error("unhandled player type");
        }
    }
    private static reloadGlobalGrid(): void {
        const grid = Main.viewGrid.generate(RuleSet.GridSize);
        const game = document.getElementById("game");
        if (game === null) // tslint:disable-line no-null-keyword
            throw new Error("html site missing element");
        Util.clearChildren(game);
        game.appendChild(grid);
    }
}

window.onload = Main.init;
function newGame(this: HTMLElement, ev: Event): void { Main.newGameFunc(); }
