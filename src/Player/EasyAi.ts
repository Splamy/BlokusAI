/// <reference path="../DualQueue.ts"/>
/// <reference path="../PosHash.ts"/>
/// <reference path="../GameState.ts"/>

class EasyAi implements IPlayer {
    private static AiStepsAdaptive = 10000;
    private static readonly winVal = 10000;
    private static readonly defWeightPiece: number = 5;
    private static readonly defWeightOpenCorner: number = 2;
    private static readonly defWeightTrueLength: number = 1;
    private static readonly defWeightLongestSpace: number = 1;
    private static readonly defWeightAccessSpace: number = 2;

    constructor(
        private weightPiece: number = EasyAi.defWeightPiece,
        private weightOpenCorner: number = EasyAi.defWeightOpenCorner,
        private weightTrueLength: number = EasyAi.defWeightTrueLength,
        private weightLongestSpace: number = EasyAi.defWeightLongestSpace,
        private weightAccessSpace: number = EasyAi.defWeightAccessSpace) {
    }

    public value(gameState: GameState, player: PlayerId): number {
        const other = Util.otherPlayer(player);
        const curPlacedQbits = gameState.getPlacedQbits();
        const hasOptions = gameState.hasOptions();
        let endBonus = 0;
        if (!hasOptions[PlayerId.p1]) {
            if (!hasOptions[PlayerId.p2]) {
                endBonus = curPlacedQbits[player] > curPlacedQbits[other] ? EasyAi.winVal : -EasyAi.winVal;
            } else if (player === PlayerId.p1 && curPlacedQbits[PlayerId.p2] >= curPlacedQbits[PlayerId.p1]) {
                endBonus = -EasyAi.winVal;
            }
        } else if (!hasOptions[PlayerId.p2] && curPlacedQbits[PlayerId.p1] >= curPlacedQbits[PlayerId.p2]) {
            endBonus = -EasyAi.winVal;
        }
        const nextCorner = gameState.getCornerMap();
        const trueLength = EasyAi.getTrueLength(gameState, player);
        const space = EasyAi.getSpace(gameState);

        // TODO change evaluation if opponent cant make any move anymore
        return endBonus
            + nextCorner[player].length / RuleSet.NormalizeOpenCorner * this.weightOpenCorner
            - nextCorner[other].length / RuleSet.NormalizeOpenCorner * this.weightOpenCorner
            + curPlacedQbits[player] / RuleSet.NormalizePiece * this.weightPiece
            + trueLength * this.weightTrueLength
            - space[player].LongestSpace * this.weightLongestSpace
            + space[other].LongestSpace * this.weightLongestSpace
            + space[player].AccessSpace * this.weightAccessSpace
            - space[other].AccessSpace * this.weightAccessSpace;
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
        let minx = Number.POSITIVE_INFINITY;
        let miny = Number.POSITIVE_INFINITY;
        let maxx = Number.NEGATIVE_INFINITY;
        let maxy = Number.NEGATIVE_INFINITY;

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

    private minmaxAdaptive(gameState: GameState): Placement | undefined {

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

        let bestOption: TreeData | undefined;
        let bestValue = Number.NEGATIVE_INFINITY;
        if (Parallel.checkParallel()) {
            Parallel.thinkEasyAi(this, tree, gameState.turn);
            for (const node of tree.Children) {
                if (node.Value! > bestValue) {
                    bestValue = node.Value!;
                    bestOption = node;
                }
            }
        } else {
            for (const node of tree.Children) {
                const nodeVal = this.minmaxAdaptiveRecusive(node, gameState.turn);
                if (nodeVal > bestValue) {
                    bestValue = nodeVal;
                    bestOption = node;
                }
            }
        }

        if (bestValue > EasyAi.winVal / 2) {
            console.log("WIN (soon)!");
        } else if (bestValue < -EasyAi.winVal / 2) {
            console.log("LOSE (opt)!");
        }

        return bestOption!.Ply;
    }

    public minmaxAdaptiveRecusive(node: TreeData, player: PlayerId): number {
        let bestValue;
        if (node.Children === undefined) {
            bestValue = this.value(node.State, player);
        } else if (node.Max) {
            bestValue = Number.NEGATIVE_INFINITY;
            for (const child of node.Children) {
                const val = this.minmaxAdaptiveRecusive(child, player);
                bestValue = Math.max(bestValue, val);
            }
        } else {
            bestValue = Number.POSITIVE_INFINITY;
            for (const child of node.Children) {
                const val = this.minmaxAdaptiveRecusive(child, player);
                bestValue = Math.min(bestValue, val);
            }
        }
        node.Children = undefined;
        node.State = undefined as any;
        return bestValue;
    }

    public readonly placeCallback = new Ev<Placement>();

    public display(gameState: GameState): void {
        console.log("Thinking!");
        const best: Placement | undefined
            // = EasyAi.minmax(gameState, 2);
            = this.minmaxAdaptive(gameState);
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
