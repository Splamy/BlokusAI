/// <reference path="Shape.ts"/>
/// <reference path="Parallel.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="Timer.ts"/>
/// <reference path="DataTable.ts"/>
/// <reference path="ShapeSelector.ts"/>
/// <reference path="Enums/PlayerId.ts"/>
/// <reference path="Player/IPlayer.ts"/>
/// <reference path="Player/Dummy.ts"/>

class Main {
    public static init(): void {
        Main.viewGrid = new ViewGrid();
        Main.autoTimer = new Timer(Main.autoPlayLoop, 1);
        //Main.genetic = new Timer(Main.geneTick, 1000);
        Main.geneticAi = [new EasyAi(2, 2, 2, 2, 2), new EasyAi(2, 2, 2, 2, 2)];

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

        //Main.genetic.start();
    }

    public static newGameFunc(): void {
        const sizeSelector
            = Util.getElementByIdSafe("newGame_size") as HTMLInputElement;
        RuleSet.setGridSize(parseInt(sizeSelector.value, 10));

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

    private static readonly players: [IPlayer, IPlayer] = [Dummy.Instance, Dummy.Instance];
    private static readonly selectors: [ShapeSelector | undefined, ShapeSelector | undefined] = [undefined, undefined];
    private static isDisplayCallback: boolean = false;
    private static aiProcessedDisplay: boolean = false;
    private static autoTimer: Timer;
    private static readonly gameHistory: GameState[] = [];

    private static viewGrid: ViewGrid;
    private static gameDiv: HTMLElement;
    private static selectorDiv: [HTMLElement, HTMLElement];
    private static gameTimelineDiv: HTMLInputElement;

    //private static genetic: Timer;
    private static geneticAi: [EasyAi, EasyAi];

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
            // Main.autoTimer.stop();
            Main.geneTick();
        }
    }

    private static placeCallback(placement?: Placement): void {
        const state = Main.viewGrid.currentState();
        const newState = state.place(placement);
        newState.lastPlacement = placement;

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
            case "3": return Main.geneticAi[selector!.player];
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

    private static geneTick() {
        const qbits = Main.viewGrid.currentState().getPlacedQbits();
        const winnerP = qbits[PlayerId.p1] > qbits[PlayerId.p2]
            ? PlayerId.p1 : PlayerId.p2;

        const winner = Main.geneticAi[winnerP];
        const loser = Main.geneticAi[Util.otherPlayer(winnerP)];

        if (Math.random() < 0.2)
            loser.weightAccessSpace = winner.weightAccessSpace;
        if (Math.random() < 0.2)
            loser.weightLongestSpace = winner.weightLongestSpace;
        if (Math.random() < 0.2)
            loser.weightOpenCorner = winner.weightOpenCorner;
        if (Math.random() < 0.2)
            loser.weightPiece = winner.weightPiece;
        if (Math.random() < 0.2)
            loser.weightTrueLength = winner.weightTrueLength;

        if (Math.random() < 0.2)
            loser.weightAccessSpace += (Math.random() - 0.5);
        if (Math.random() < 0.2)
            loser.weightLongestSpace += (Math.random() - 0.5);
        if (Math.random() < 0.2)
            loser.weightOpenCorner += (Math.random() - 0.5);
        if (Math.random() < 0.2)
            loser.weightPiece += (Math.random() - 0.5);
        if (Math.random() < 0.2)
            loser.weightTrueLength += (Math.random() - 0.5);

        console.log(`Old champion: (${winner.weightAccessSpace},${winner.weightLongestSpace},${winner.weightOpenCorner},${winner.weightPiece},${winner.weightTrueLength}) New challanger (${loser.weightAccessSpace},${loser.weightLongestSpace},${loser.weightOpenCorner},${loser.weightPiece},${loser.weightTrueLength})`);

        Main.newGameFunc();
    }
}

function newGame(this: HTMLElement, ev: Event): void { Main.newGameFunc(); }

// check if we are a worker to do nothing
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
    console.log("Worker initialized");
} else {
    window.onload = Main.init;
    if (Parallel.checkParallel())
        console.log("Parallel operations supported");
    else
        console.log("Parallel operations not supported");
}
