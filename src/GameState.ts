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

    private cornerMap?: [Corner[], Corner[]];
    private placeOptions?: Placement[];

    private constructor(
        public readonly availableShapes: [boolean[], boolean[]],
        public readonly gameGrid: PlayerId[][],
        public readonly turn: PlayerId) { }

    public isFreeNoTouch(placement: Placement): boolean {
        const m = RuleSet.GridSize - 1;
        for (const pos of placement.getPosArr()) {
            if (!GameState.isValidPlace(pos)
                || this.gameGrid[pos.y][pos.x] !== PlayerId.none
                || (pos.x > 0 && this.gameGrid[pos.y][pos.x - 1] === this.turn)
                || (pos.y > 0 && this.gameGrid[pos.y - 1][pos.x] === this.turn)
                || (pos.x < m && this.gameGrid[pos.y][pos.x + 1] === this.turn)
                || (pos.y < m && this.gameGrid[pos.y + 1][pos.x] === this.turn))
                return false;
        }
        return true;
    }

    public canPlace(placement: Placement, checkCorner: boolean = false): boolean {
        const availShapesTurn = this.availableShapes[this.turn];
        // check is user has used the shape already
        if (!availShapesTurn[placement.shape.Type])
            return false;

        // check if the place itself is free and is not touching other own shapes
        if (!this.isFreeNoTouch(placement))
            return false;

        // optionally check if shape is touching at least one corner
        if (checkCorner) {
            let isValid: boolean = false;
            const curCornerMap = this.getCornerMap()[this.turn];
            // check if corners are available
            if (curCornerMap.length === 0) {
                // might be first turn or was player's last :P
                if (availShapesTurn.every((x) => x)) {
                    const startPos = this.getStartingPos();
                    for (const pos of placement.getPosArr()) {
                        if (pos.equals(startPos)) {
                            isValid = true;
                            break;
                        }
                    }
                }
            } else {
                // see if it corners another field
                cornerLoop: for (const corner of curCornerMap) {
                    for (const varCorner of placement.shape.Variants[placement.variant].Corners) {
                        if (corner.diagMatch(varCorner.dir)
                            && varCorner.toPlace(Pos.Zero).add(placement.pos).equals(corner.pos)
                            && this.gameGrid[corner.pos.y][corner.pos.x] === this.turn) {
                            isValid = true;
                            break cornerLoop;
                        }
                    }
                }
            }
            if (!isValid)
                return false;
        }

        return true;
    }

    public place(placement?: Placement): GameState {
        if (placement === undefined)
            return new GameState(this.availableShapes, this.gameGrid, Util.otherPlayer(this.turn));

        const grid = ViewGrid.cloneGrid(this.gameGrid);
        for (const pos of placement.getPosArr()) {
            if (!GameState.isValidPlace(pos)) {
                throw new Error("INVALID PLACED SHAPE");
            }
            grid[pos.y][pos.x] = this.turn;
        }
        const nextShapes = this.availableShapes.slice(0) as [boolean[], boolean[]];
        nextShapes[this.turn] = nextShapes[this.turn].slice(0);
        nextShapes[this.turn][placement.shape.Type] = false;
        return new GameState(nextShapes, grid, Util.otherPlayer(this.turn));
    }

    public getCornerMap(): [Corner[], Corner[]] {
        if (this.cornerMap !== undefined)
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

    public getPlacedQbits(): [number, number] {
        const p1Placed = this.availableShapes[PlayerId.p1].reduce(
            (sum, sava, ix) => sava ? sum + Shape.AllShapes[ix].Value : sum, 0);
        const p2Placed = this.availableShapes[PlayerId.p2].reduce(
            (sum, sava, ix) => sava ? sum + Shape.AllShapes[ix].Value : sum, 0);
        return [p1Placed, p2Placed];
    }

    public getPlaceOption(): Placement[] {
        if (this.placeOptions !== undefined)
            return this.placeOptions;

        this.placeOptions = [];

        const availShapesTurn = this.availableShapes[this.turn];
        const curCornerMap = this.getCornerMap()[this.turn];
        // check if this is the first turn or player can't place anymore
        if (curCornerMap.length === 0) {
            if (availShapesTurn.every((x) => x))
                return this.getEmptyPlaceOptions();
            else
                return [];
        }
        for (let i = 0; i < Shape.AllShapes.length; i++) { // go over all available shapes
            if (!availShapesTurn[i])
                continue;
            const shape = Shape.AllShapes[i];
            for (const corner of curCornerMap) { // go over all corner on the map
                for (let varNum = 0; varNum < shape.Variants.length; varNum++) { // go over all variants of that shape
                    const variant = shape.Variants[varNum];
                    for (const varCorner of variant.Corners) { // go over all corner of that variant
                        if (!corner.diagMatch(varCorner.dir))
                            continue;
                        const tryPlace = new Placement(corner.toPlace(varCorner.pos), shape, varNum);
                        if (this.canPlace(tryPlace)) {
                            this.placeOptions.push(tryPlace);
                        }
                    }
                }
            }
        }

        return this.placeOptions;
    }

    private getEmptyPlaceOptions(): Placement[] {
        const emptyPlacement: Placement[] = [];
        const startPos = this.getStartingPos();

        for (const shape of Shape.AllShapes) { // go over all available shapes
            for (let varNum = 0; varNum < shape.Variants.length; varNum++) { // go over all variants of that shape
                const variant = shape.Variants[varNum];
                for (let y = 0; y < variant.Size.y; y++) {
                    for (let x = 0; x < variant.Size.x; x++) {
                        if (variant.Form[y][x]) {
                            const tryPlace = new Placement(startPos.subi(x, y), shape, varNum);
                            if (this.canPlace(tryPlace))
                                emptyPlacement.push(tryPlace);
                        }
                    }
                }
            }
        }

        return emptyPlacement;
    }

    private getStartingPos(): Pos {
        return (this.turn === PlayerId.p1)
            ? new Pos(4, 4)
            : new Pos(this.gameGrid[0].length - 5, this.gameGrid.length - 5);
    }
}
