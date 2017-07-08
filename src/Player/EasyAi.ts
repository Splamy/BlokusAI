/// <reference path="../DualQueue.ts"/>
/// <reference path="../PosHash.ts"/>
/// <reference path="../GameState.ts"/>

class EasyAi implements IPlayer {
    private static AiSteps = 2;
    private static AiStepsAdaptive = 100000;
    private static readonly weightPiece: number = 5;
    private static readonly weightOpenCorner: number = 2;
    private static readonly weightTrueLength: number = 1;
    private static readonly weightLongestSpace: number = 1;
    private static readonly weightAccessSpace: number = 2;

    public static value(gameState: GameState, player: PlayerId): number {
        const other = Util.otherPlayer(player);
        const curPlacedQbits = gameState.getPlacedQbits();
        const hasOptions = gameState.hasOptions();
        if (!hasOptions[PlayerId.p1]) {
            if (!hasOptions[PlayerId.p2]) {
                return curPlacedQbits[player] > curPlacedQbits[other] ? Number.MAX_VALUE : Number.MIN_VALUE;
            } else if (player === PlayerId.p1 && curPlacedQbits[PlayerId.p2] >= curPlacedQbits[PlayerId.p1]) {
                return Number.MIN_VALUE;
            }
        } else if (!hasOptions[PlayerId.p2] && curPlacedQbits[PlayerId.p1] >= curPlacedQbits[PlayerId.p2]) {
            return Number.MIN_VALUE;
        }
        const nextCorner = gameState.getCornerMap();
        const trueLength = EasyAi.getTrueLength(gameState, player);
        const space = EasyAi.getSpace(gameState);

        return nextCorner[player].length / RuleSet.NormalizeOpenCorner * EasyAi.weightOpenCorner
            - nextCorner[other].length / RuleSet.NormalizeOpenCorner * EasyAi.weightOpenCorner
            + curPlacedQbits[player] / RuleSet.NormalizePiece * EasyAi.weightPiece
            + trueLength * EasyAi.weightTrueLength
            - space[player].LongestSpace * EasyAi.weightLongestSpace
            + space[other].LongestSpace * EasyAi.weightLongestSpace
            + space[player].AccessSpace * EasyAi.weightAccessSpace
            - space[other].AccessSpace * EasyAi.weightAccessSpace;
    }

    public static getSpace(gameState: GameState): [StateData, StateData] {
        const cornerMap = gameState.getCornerMap();
        const res: [StateData, StateData] = [new StateData(), new StateData()];
        for (const pId of Player.Ids) {
            const cornerList = cornerMap[pId];
            const posQueue = new DualQueue<Pos>();
            for (const corner of cornerList) {
                posQueue.push(corner.target);
            }

            const grid = ViewGrid.cloneGrid(gameState.gameGrid);
            let dist = 0;
            let fldCount = 0;
            while (posQueue.swap()) {
                for (let i = 0; i < posQueue.swaplength; i++) {
                    const pos = posQueue.dequeue();
                    if (pos.x > 0 && grid[pos.y][pos.x - 1] === PlayerId.none) {
                        grid[pos.y][pos.x - 1] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x - 1, pos.y));
                        fldCount++;
                    }
                    if (pos.x < RuleSet.GridSize - 1 && grid[pos.y][pos.x + 1] === PlayerId.none) {
                        grid[pos.y][pos.x + 1] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x + 1, pos.y));
                        fldCount++;
                    }
                    if (pos.y > 0 && grid[pos.y - 1][pos.x] === PlayerId.none) {
                        grid[pos.y - 1][pos.x] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x, pos.y - 1));
                        fldCount++;
                    }
                    if (pos.y < RuleSet.GridSize - 1 && grid[pos.y + 1][pos.x] === PlayerId.none) {
                        grid[pos.y + 1][pos.x] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x, pos.y + 1));
                        fldCount++;
                    }
                }
                dist++;
            }

            res[pId].LongestSpace = dist / RuleSet.NormalizeLongestSpace;
            res[pId].AccessSpace = fldCount / RuleSet.NormalizeAccessSpace;
        }

        return res;
    }

    private static getTrueLength(gameState: GameState, player: PlayerId): number {
        let minx = Number.MAX_VALUE;
        let miny = Number.MAX_VALUE;
        let maxx = Number.MIN_VALUE;
        let maxy = Number.MIN_VALUE;

        for (let y = 0; y < gameState.gameGrid.length; y++) {
            const line = gameState.gameGrid[y];
            for (let x = 0; x < line.length; x++) {
                if (line[x] === player) {
                    minx = Math.min(minx, x);
                    maxx = Math.max(maxx, x);
                    miny = Math.min(miny, y);
                    maxy = Math.max(maxy, y);
                }
            }
        }
        return ((maxx - minx) + (maxy - miny)) / RuleSet.NormalizeTrueLength;
    }

    private static minmax(gameState: GameState, depth: number): Placement | undefined {
        if (depth === 0) {
            return undefined;
        } else {
            const options = gameState.getPlaceOption();
            let best: Placement | undefined;
            let score: number = -1;
            for (const opt of options) {
                const nextState = gameState.place(opt);
                const nextScore = this.minmaxScored(nextState, depth - 1, false, gameState.turn);
                if (nextScore > score) {
                    score = nextScore;
                    best = opt;
                }
            }
            return best;
        }
    }

    private static minmaxScored(gameState: GameState, depth: number, max: boolean, player: PlayerId): number {
        if (depth === 0) {
            return this.value(gameState, player);
        } else {
            const options = gameState.getPlaceOption();
            let score: number = max ? Number.MIN_VALUE : Number.MAX_VALUE;
            for (const opt of options) {
                const nextState = gameState.place(opt);
                const nextScore = this.minmaxScored(nextState, depth - 1, !max, player);
                if (max)
                    score = Math.max(nextScore, score);
                else
                    score = Math.min(nextScore, score);
            }
            return score;
        }
    }

    private static minmaxAdaptive(gameState: GameState): Placement | undefined {

        const dq = new DualQueue<TreeData>();
        const tree: TreeData = new TreeData(true, gameState);

        let options = gameState.getPlaceOption();
        if (options.length === 0)
            return undefined;

        tree.Children = [];
        for (const opt of options) {
            const nextState = gameState.place(opt);
            const childNode = new TreeData(false, nextState, undefined, opt);
            tree.Children.push(childNode);
            dq.push(childNode);
        }
        let steps = options.length;
        let depth = 0;

        // adaptive depth calculations
        console.log("Adapting!");
        while (steps < EasyAi.AiStepsAdaptive && dq.swap()) {
            for (let i = 0; i < dq.swaplength; i++) {
                const node = dq.dequeue();
                options = node.State.getPlaceOption();
                if (options.length === 0)
                    continue;
                node.Children = [];
                const childMax = !node.Max;
                for (const opt of options) {
                    const nextState = node.State.place(opt);
                    const childNode = new TreeData(childMax, nextState);
                    node.Children.push(childNode);
                    dq.push(childNode);
                }
                steps += options.length;
            }
            depth++;
        }
        console.log(`Target depth:${depth} states:${steps}!`);

        // minmax calculations
        console.log("Working!");
        EasyAi.minmaxAdaptiveRecusive(tree, gameState.turn);
        let bestOption = tree.Children[0];
        let bestValue = bestOption.Value!;
        for (const node of tree.Children) {
            if (node.Value! > bestValue) {
                bestValue = node.Value!;
                bestOption = node;
            }
        }
        if (bestValue === Number.MAX_VALUE) {
            console.log("WIN (soon)!");
        }

        return bestOption.Ply;
    }

    private static minmaxAdaptiveRecusive(node: TreeData, player: PlayerId): number {
        let bestValue;
        if (node.Children === undefined) {
            bestValue = EasyAi.value(node.State, player);
            node.Value = bestValue;
        } else if (node.Max) {
            bestValue = Number.MIN_VALUE;
            for (const child of node.Children) {
                const val = EasyAi.minmaxAdaptiveRecusive(child, player);
                bestValue = Math.max(bestValue, val);
            }
        } else {
            bestValue = Number.MAX_VALUE;
            for (const child of node.Children) {
                const val = EasyAi.minmaxAdaptiveRecusive(child, player);
                bestValue = Math.min(bestValue, val);
            }
        }
        if (node.Ply !== undefined) {
            node.Value = bestValue;
        }
        return bestValue;
    }

    public readonly placeCallback = new Ev<Placement>();

    public display(gameState: GameState): void {
        console.log("Thinking!");
        const best: Placement | undefined
            = EasyAi.minmax(gameState, 2);
        // = EasyAi.minmaxAdaptive(gameState);
        console.log("Done :P");
        this.placeCallback.invoke(best);
    }
}

// tslint:disable max-classes-per-file
class StateData {
    public LongestSpace: number;
    public AccessSpace: number;
}

class TreeData {
    public Value?: number;

    constructor(
        public Max: boolean,
        public State: GameState,
        public Children?: TreeData[],
        public Ply?: Placement) {
    }
}
