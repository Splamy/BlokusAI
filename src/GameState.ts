/// <reference path="Enums/PlayerId.ts"/>

class GameState {
    public static start(): GameState {
        const grid = ViewGrid.generateGrid(PlayerId.none, RuleSet.GridSize, RuleSet.GridSize);
        const shapesAvail: boolean[] = new Array(RuleSet.ShapeCount);
        for (let i = 0; i < RuleSet.ShapeCount; i++)
            shapesAvail[i] = true;
        return new GameState([shapesAvail, shapesAvail], grid, PlayerId.p1);
    }

    private static isValidPlace(pos: Pos): boolean {
        return pos.x >= 0 && pos.y >= 0
            && pos.x < RuleSet.GridSize && pos.y < RuleSet.GridSize;
    }

    public readonly turn: PlayerId;
    public readonly players: [boolean[], boolean[]];
    public readonly gameGrid: PlayerId[][];

    private constructor(p: [boolean[], boolean[]], grid: PlayerId[][], turn: PlayerId) {
        this.players = p;
        this.gameGrid = grid;
        this.turn = turn;
    }

    public isFree(posArr: Pos[]): boolean {
        for (const pos of posArr) {
            if (!GameState.isValidPlace(pos)
                || this.gameGrid[pos.y][pos.x] !== PlayerId.none)
                return false;
        }
        return true;
    }

    public canPlace(pos: Pos, shape: Shape, variant: number, player: PlayerId): boolean {
        const posArr: Pos[] = Shape.at(pos, shape.Variants[variant]);
        if (!this.isFree(posArr))
            return false;
        if (player !== PlayerId.none) {
            // check is user has used the shape already
            if (!this.players[player][shape.Type])
                return false;
        }
        // TODO check if is valid rulewise
        return true;
    }

    public place(posArr: Pos[], shape: ShapeType): GameState {
        const player = this.turn;
        const grid = ViewGrid.cloneGrid(this.gameGrid);
        for (const pos of posArr) {
            if (!GameState.isValidPlace(pos)) {
                console.log("INVALID PLACED SHAPE");
                continue;
            }
            grid[pos.y][pos.x] = player;
        }
        const nextShapes = this.players.slice(0) as [boolean[], boolean[]];
        nextShapes[player] = nextShapes[player].slice(0);
        nextShapes[player][shape] = false;
        return new GameState(nextShapes, grid, Util.otherPlayer(player));
    }
}
