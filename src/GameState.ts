/// <reference path="Enums/PlayerId.ts"/>

class GameState {
    public static start(): GameState {
        const grid = ViewGrid.generateGrid(PlayerId.none, RuleSet.GridSize, RuleSet.GridSize);
        const shapesAvail: boolean[] = new Array(Shape.ShapeCount);
        for (let i = 0; i < Shape.ShapeCount; i++)
            shapesAvail[i] = true;
        return new GameState([shapesAvail, shapesAvail], grid, PlayerId.p1);
    }

    private static isValidPlace(pos: Pos): boolean {
        return pos.x >= 0 && pos.y >= 0
            && pos.x < RuleSet.GridSize && pos.y < RuleSet.GridSize;
    }

    public readonly turn: PlayerId;
    public readonly availableShapes: [boolean[], boolean[]];
    public readonly gameGrid: PlayerId[][];
    private cornerMap: [Corner[], Corner[]] | null;
    private placeOptions: Placement[] | null;

    private constructor(p: [boolean[], boolean[]], grid: PlayerId[][], turn: PlayerId) {
        this.availableShapes = p;
        this.gameGrid = grid;
        this.turn = turn;
        this.cornerMap = null;
        this.placeOptions = null;
    }

    public isFree(placement: Placement): boolean {
        for (const pos of placement.getPosArr()) {
            if (!GameState.isValidPlace(pos)
                || this.gameGrid[pos.y][pos.x] !== PlayerId.none)
                return false;
        }
        return true;
    }

    public canPlace(placement: Placement): boolean {
        if (!this.isFree(placement))
            return false;
        // check is user has used the shape already
        if (!this.availableShapes[this.turn][placement.shape.Type])
            return false;
        // TODO check if is valid rulewise
        return true;
    }

    public place(placement: Placement): GameState {
        const player = this.turn;
        const grid = ViewGrid.cloneGrid(this.gameGrid);
        for (const pos of placement.getPosArr()) {
            if (!GameState.isValidPlace(pos)) {
                throw new Error("INVALID PLACED SHAPE");
            }
            grid[pos.y][pos.x] = player;
        }
        const nextShapes = this.availableShapes.slice(0) as [boolean[], boolean[]];
        nextShapes[player] = nextShapes[player].slice(0);
        nextShapes[player][placement.shape.Type] = false;
        return new GameState(nextShapes, grid, Util.otherPlayer(player));
    }

    public getCornerMap(): [Corner[], Corner[]] {
        if (this.cornerMap !== null)
            return this.cornerMap;

        this.cornerMap = [[], []];

        for (let y = 0; y < this.gameGrid.length; y++) {
            const line = this.gameGrid[y];
            for (let x = 0; x < line.length; x++) {
                const cell = line[x];
                if (cell === PlayerId.none)
                    continue;
                const topEdge = y <= 0;
                const botEdge = y >= this.gameGrid.length - 1;
                const leftEdge = x <= 0;
                const rightEdge = x >= line.length - 1;

                const yTop = !topEdge && this.gameGrid[y - 1][x] !== cell;
                const yBot = !botEdge && this.gameGrid[y + 1][x] !== cell;
                const yLeft = !leftEdge && line[x - 1] !== cell;
                const yRight = !rightEdge && line[x + 1] !== cell;

                if (yLeft) {
                    if (yTop && this.gameGrid[y - 1][x - 1] === PlayerId.none) {
                        this.cornerMap[cell].push(new Corner(new Pos(x, y), CornerDir.TopLeft));
                    }
                    if (yBot && this.gameGrid[y + 1][x - 1] === PlayerId.none) {
                        this.cornerMap[cell].push(new Corner(new Pos(x, y), CornerDir.BotLeft));
                    }
                }
                if (yRight) {
                    if (yTop && this.gameGrid[y - 1][x + 1] === PlayerId.none) {
                        this.cornerMap[cell].push(new Corner(new Pos(x, y), CornerDir.TopRight));
                    }
                    if (yBot && this.gameGrid[y + 1][x + 1] === PlayerId.none) {
                        this.cornerMap[cell].push(new Corner(new Pos(x, y), CornerDir.BotRight));
                    }
                }
            }
        }

        return this.cornerMap;
    }

    public getPlaceOption(): Placement[] {
        if (this.placeOptions !== null)
            return this.placeOptions;

        this.placeOptions = [];

        const availShapesTurn = this.availableShapes[this.turn];
        const curCornerMap = this.getCornerMap();
        for (let i = 0; i < Shape.AllShapes.length; i++) {
            if (!availShapesTurn[i])
                continue;
            const shape = Shape.AllShapes[i];
            for (let j = 0; j < shape.Variants.length; j++) {
                const variant = shape.Variants[j];
                const corners = shape.Corners[j];
            }
        }

        return this.placeOptions;
    }
}
