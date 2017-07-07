/// <reference path="../DualQueue.ts"/>

class EasyAi implements IPlayer {

    public static AiSteps = 2;

    public static get_space(gameState: GameState): [number, number] {
        const cornerMap = gameState.getCornerMap();
        const res: [number, number] = [0, 0];
        for (const pId of Player.Ids) {
            const cornerList = cornerMap[pId];
            const posQueue = new DualQueue<Pos>();
            for (const corner of cornerList) {
                posQueue.push(corner.toPlace());
            }
            const grid = ViewGrid.cloneGrid(gameState.gameGrid);
            let dist = 0;
            while (posQueue.swap()) {
                for (let i = 0; i < posQueue.length; i++) { // tslint:disable-line prefer-for-of
                    const pos = posQueue.dequeue();
                    if (pos.x > 0 && grid[pos.y][pos.x - 1] === PlayerId.none) {
                        grid[pos.y][pos.x - 1] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x - 1, pos.y));
                    }
                    if (pos.x < RuleSet.GridSize - 1 && grid[pos.y][pos.x + 1] === PlayerId.none) {
                        grid[pos.y][pos.x + 1] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x + 1, pos.y));
                    }
                    if (pos.y > 0 && grid[pos.y - 1][pos.x] === PlayerId.none) {
                        grid[pos.y - 1][pos.x] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x, pos.y - 1));
                    }
                    if (pos.y < RuleSet.GridSize - 1 && grid[pos.y + 1][pos.x] === PlayerId.none) {
                        grid[pos.y + 1][pos.x] = PlayerId.hover;
                        posQueue.push(new Pos(pos.x, pos.y + 1));
                    }
                }
                dist++;
            }

            res[pId] = dist;
        }

        return res;
    }

    private static readonly weightPiece: number = 3;
    private static readonly weightOpenCorner: number = 1;
    private static readonly weightTrueLength: number = 2;
    private static readonly weightSpace: number = 2;

    private static value(gameState: GameState, player: PlayerId): number {
        const curPlacedQbits = gameState.getPlacedQbits()[player];
        const nextCorner = gameState.getCornerMap();
        const trueLength = EasyAi.get_true_length(gameState, player);
        const space = EasyAi.get_space(gameState);

        const other = Util.otherPlayer(player);
        return nextCorner[player].length * EasyAi.weightOpenCorner
            - nextCorner[other].length * EasyAi.weightOpenCorner
            + curPlacedQbits * EasyAi.weightPiece
            + trueLength * EasyAi.weightTrueLength
            - space[player] * EasyAi.weightSpace
            + space[other] * EasyAi.weightSpace;
    }

    private static get_true_length(gameState: GameState, player: PlayerId): number {
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
        return Math.sqrt((maxx - minx) * (maxy - miny));
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
                const nextScore = this.minmax_scored(nextState, depth - 1, false, gameState.turn);
                if (nextScore > score) {
                    score = nextScore;
                    best = opt;
                }
            }
            return best;
        }
    }

    private static minmax_scored(gameState: GameState, depth: number, max: boolean, player: PlayerId): number {
        if (depth === 0) {
            return this.value(gameState, player);
        } else {
            const options = gameState.getPlaceOption();
            let score: number = max ? Number.MIN_VALUE : Number.MAX_VALUE;
            for (const opt of options) {
                const nextState = gameState.place(opt);
                const nextScore = this.minmax_scored(nextState, depth - 1, !max, player);
                if (max)
                    score = Math.max(nextScore, score);
                else
                    score = Math.min(nextScore, score);
            }
            return score;
        }
    }

    public readonly placeCallback = new Ev<Placement>();

    public display(gameState: GameState): void {
        console.log("Thinking!");
        const best: Placement | undefined = EasyAi.minmax(gameState, EasyAi.AiSteps);
        console.log("Done :P");
        this.placeCallback.invoke(best);
    }
}
