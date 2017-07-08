/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="Timer.ts"/>
/// <reference path="DataTable.ts"/>
/// <reference path="ShapeSelector.ts"/>
/// <reference path="Enums/PlayerId.ts"/>
/// <reference path="Player/IPlayer.ts"/>
/// <reference path="Player/Dummy.ts"/>

class Main {
    public static init(): void {
        // generate color sheme for player 1 and 2
        Css.GenerateCustomStyle(0, 240);

        Main.selectorDiv = [] as any;
        for (const pId of Player.Ids) {
            Main.selectorDiv[pId] = Util.getElementByIdSafe("selector" + String(pId));
            const selector = new ShapeSelector(pId);
            Main.selectors[pId] = selector;
            Main.selectorDiv[pId].appendChild(selector.generate());
        }

        Main.gameDiv = Util.getElementByIdSafe("game");
        Main.gameTimelineDiv = Util.getElementByIdSafe("gameTimeline") as HTMLInputElement;
        Main.gameTimelineDiv.oninput = Main.changeHistory;
    }

    public static newGameFunc(): void {
        const sizeSelector
            = Util.getElementByIdSafe("newGame_size") as HTMLInputElement;
        RuleSet.setGridSize(parseInt(sizeSelector.value, 10));
        Main.emptyTurns = 0;

        Main.viewGrid.cbClear.clear();
        Main.viewGrid.cbClick.clear();
        Main.viewGrid.cbHover.clear();
        Main.viewGrid.cbWheel.clear();

        for (let i = 0; i < 2; i++) {
            Main.players[i].placeCallback.clear();
            const brain = Util.getElementByIdSafe("newGame_player" + String(i)) as HTMLInputElement;
            brain.classList.remove("win");
            const selector = Main.selectors[i]!;
            selector.shapeSelected.clear();
            Main.players[i] = Main.selectionToClass(brain.value, selector);
            Main.players[i].placeCallback.register(null, Main.placeCallback); // tslint:disable-line no-null-keyword
        }

        // history
        Util.clearArray(Main.gameHistory);
        const gameState = GameState.start();
        Main.gameHistory.push(gameState);
        Main.gameTimelineDiv.max = "0";
        Main.gameTimelineDiv.value = "0";

        Main.reloadGlobalGrid();
        Main.updateView(gameState);

        Main.autoTimer.start();
    }

    private static readonly debugView: boolean = true;

    private static readonly viewGrid: ViewGrid = new ViewGrid();
    private static readonly players: [IPlayer, IPlayer] = [Dummy.Instance, Dummy.Instance];
    private static readonly selectors: [ShapeSelector | undefined, ShapeSelector | undefined] = [undefined, undefined];
    private static isDisplayCallback: boolean = false;
    private static aiProcessedDisplay: boolean = false;
    private static readonly autoTimer: Timer = new Timer(Main.autoPlayLoop, 1);
    private static readonly gameHistory: GameState[] = [];
    private static emptyTurns: number = 0;

    private static gameDiv: HTMLElement;
    private static selectorDiv: [HTMLElement, HTMLElement];
    private static gameTimelineDiv: HTMLInputElement;

    private static autoPlayLoop(): void {
        const gameState = Main.viewGrid.currentState();

        Main.isDisplayCallback = true;
        Main.players[gameState.turn].display(gameState);
        Main.isDisplayCallback = false;
        const aiProcDisp = Main.aiProcessedDisplay;
        Main.aiProcessedDisplay = false;
        if (!aiProcDisp) {
            // item was not placed by an AI, check if human can still place
            const placeOptions = gameState.getPlaceOption();
            // if human can still play stop timer and let him play
            if (placeOptions.length > 0)
                Main.autoTimer.stop();
            else
                Main.placeCallback(undefined);
        }

        if (Main.isGameOver(gameState)) {
            Main.autoTimer.stop();
        }
    }

    private static placeCallback(placement?: Placement): void {
        const state = Main.viewGrid.currentState();
        const newState = state.place(placement);

        // check for empty moves to recognize end of game
        if (placement === undefined)
            Main.emptyTurns++;
        else
            Main.emptyTurns = 0;

        // doing histoy features
        const nextHistId = parseInt(Main.gameTimelineDiv.value, 10) + 1;
        Main.gameHistory.length = nextHistId;
        Main.gameHistory.push(newState);
        Main.gameTimelineDiv.max = String(nextHistId);
        Main.gameTimelineDiv.value = String(nextHistId);

        // update our grahical view
        Main.updateView(newState);

        // notify other player about turn
        if (Main.isDisplayCallback) {
            Main.aiProcessedDisplay = true;
        } else {
            Main.autoTimer.start();
        }
    }

    private static updateView(gameState: GameState) {
        Main.viewGrid.clearHover();
        Main.viewGrid.display(gameState);
        for (const pId of Player.Ids) {
            Main.selectors[pId]!.display(gameState);
        }

        const dataSet = DataTable.generateTable(gameState);
        const qbits = Main.isGameOver(gameState) ? gameState.getPlacedQbits() : undefined;

        for (const pId of Player.Ids) {
            Main.selectorDiv[pId].classList.remove("turn");

            const brain = Util.getElementByIdSafe("newGame_player" + String(pId)) as HTMLInputElement;
            brain.classList.remove("win", "lose");
            if (qbits !== undefined)
                brain.classList.add(qbits[pId] > qbits[Util.otherPlayer(pId)] ? "win" : "lose");

            const data = Util.getElementByIdSafe("data" + String(pId)) as HTMLDivElement;
            data.innerHTML = dataSet[pId];
        }

        Main.selectorDiv[gameState.turn].classList.add("turn");

        if (Main.debugView) {
            const debugCorMap = gameState.getCornerMap();
            Main.viewGrid.debugDisplayCorner([...debugCorMap[0], ...debugCorMap[1]]);
        }
    }

    private static selectionToClass(selection: string, selector?: ShapeSelector): IPlayer {
        switch (selection) {
            case "0":
                if (selector === undefined)
                    throw new Error("selector must be passed for human player");
                return new Human(Main.viewGrid, selector);
            case "1": return new RandomAi();
            case "2": return new EasyAi();
            default: throw new Error("unhandled player type");
        }
    }

    private static reloadGlobalGrid(): void {
        const grid = Main.viewGrid.generate(RuleSet.GridSize);
        Util.clearChildren(Main.gameDiv);
        Main.gameDiv.appendChild(grid);
        grid.classList.add("gameGrid");
    }

    private static changeHistory(): void {
        const histId = parseInt(Main.gameTimelineDiv.value, 10);
        const histState = Main.gameHistory[histId];
        Main.updateView(histState);
    }

    private static isGameOver(gameState: GameState): boolean {
        const options = gameState.getPlaceOption();
        if (options.length !== 0)
            return false;
        const other = gameState.place(undefined);
        const otherOptions = other.getPlaceOption();
        return otherOptions.length === 0;
    }
}

window.onload = Main.init;
function newGame(this: HTMLElement, ev: Event): void { Main.newGameFunc(); }
