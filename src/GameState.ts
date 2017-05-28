/// <reference path="PlayerId.ts"/>

class GameState {
    public readonly turn: PlayerId;
    public readonly player1: boolean[];
    public readonly player2: boolean[];
    public readonly gameGrid: PlayerId[][];

    public static start(): GameState {
        const grid = ViewGrid.generateGrid(PlayerId.none, RuleSet.GridSize, RuleSet.GridSize);
        const shapesAvail: boolean[] = new Array(RuleSet.ShapeCount);
        for (var i = 0; i < RuleSet.ShapeCount; i++)
            shapesAvail[i] = true;
        return new GameState(shapesAvail, shapesAvail, grid, PlayerId.p1);
    }

    private constructor(p1: boolean[], p2: boolean[], grid: PlayerId[][], turn: PlayerId) {
        this.player1 = p1;
        this.player2 = p2;
        this.gameGrid = grid;
        this.turn = turn;
    }

    public isFree(posArr: Pos[]): boolean {
        for (var i = 0; i < posArr.length; i++) {
            var pos = posArr[i];
            if (this.gameGrid[pos.y][pos.x] !== PlayerId.none)
                return false;
        }
        return true;
    }

    public canPlace(pos: Pos, shape: Shape, variant: number, player: PlayerId): boolean {
        let posArr: Pos[] = Shape.at(pos, shape.Variants[variant]);
        if (!this.isFree(posArr))
            return false;
        if (player !== PlayerId.none) {
            const checkPlayer = player === PlayerId.p1 ? this.player1 : this.player2;
            // check is user has used the shape already
            if (!checkPlayer[shape.Type])
                return false;
        }
        // TODO check if is valid rulewise
        return true;
    }

    public place(posArr: Pos[], shape: ShapeType, player: PlayerId): GameState {
        if (player === PlayerId.none) { throw new Error("invalid player"); }
        const grid = ViewGrid.cloneGrid(this.gameGrid);
        for (let i = 0; i < posArr.length; i++) {
            let pos = posArr[i];
            grid[pos.y][pos.x] = player;
        }
        let p = [null, this.player1, this.player2];
        p[player] = p[player].slice(0);
        p[player][shape] = false;
        const nextTurn = this.turn === PlayerId.p1 ? PlayerId.p2 : PlayerId.p1;
        return new GameState(p[PlayerId.p1], p[PlayerId.p2], grid, nextTurn);
    }
}