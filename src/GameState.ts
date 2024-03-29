/// <reference path="Enums/PlayerId.ts"/>
/// <reference path="PosHash.ts"/>

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

    private placedQbits?: [number, number];
    private cornerMap?: [Corner[], Corner[]];
    private placeOptions?: Placement[];
    public lastPlacement?: Placement;

    private constructor(
        public readonly availableShapes: [boolean[], boolean[]],
        public readonly gameGrid: PlayerId[][],
        public readonly turn: PlayerId) { }

    public hackSet(pos: Pos, player: PlayerId): void {
        this.placedQbits = undefined;
        this.cornerMap = undefined;
        this.placeOptions = undefined;
        this.gameGrid[pos.y][pos.x] = player;
    }

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
                    const startPos = RuleSet.StartPos[this.turn];
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
                            && varCorner.target.addeq(placement.pos, corner.pos)
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
        if (placement === undefined) {
            const nextState = new GameState(this.availableShapes, this.gameGrid, Util.otherPlayer(this.turn));
            nextState.placedQbits = this.placedQbits;
            nextState.cornerMap = this.cornerMap;
            return nextState;
        }

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
        const nextState = new GameState(nextShapes, grid, Util.otherPlayer(this.turn));
        nextState.placedQbits = this.getPlacedQbits().slice() as [number, number];
        nextState.placedQbits[this.turn] += placement.shape.Value;
        return nextState;
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

        // Dead corner elimination
        const m = RuleSet.GridSize - 1;
        for (const pId of Player.Ids) {
            const posHash = new PosHash();
            const swapArr: Corner[] = [];
            for (const cor of this.cornerMap[pId]) {
                const pos = cor.target;
                if ((pos.x <= 0 || this.gameGrid[pos.y][pos.x - 1] !== pId)
                    && (pos.y <= 0 || this.gameGrid[pos.y - 1][pos.x] !== pId)
                    && (pos.x >= m || this.gameGrid[pos.y][pos.x + 1] !== pId)
                    && (pos.y >= m || this.gameGrid[pos.y + 1][pos.x] !== pId)
                    && posHash.add(pos))
                    swapArr.push(cor);
            }
            this.cornerMap[pId] = swapArr;
        }
        return this.cornerMap;
    }

    public getPlacedQbits(): [number, number] {
        if (this.placedQbits !== undefined)
            return this.placedQbits;

        const p1Placed = Shape.QbitMax - this.availableShapes[PlayerId.p1].reduce(
            (sum, sava, ix) => sava ? sum + Shape.AllShapes[ix].Value : sum, 0);
        const p2Placed = Shape.QbitMax - this.availableShapes[PlayerId.p2].reduce(
            (sum, sava, ix) => sava ? sum + Shape.AllShapes[ix].Value : sum, 0);
        this.placedQbits = [p1Placed, p2Placed];
        return this.placedQbits;
    }

    public getPlaceOption(): Placement[] {
        if (this.placeOptions !== undefined)
            return this.placeOptions;

        const availShapesTurn = this.availableShapes[this.turn];
        const curCornerMap = this.getCornerMap()[this.turn];
        // check if this is the first turn or player can't place anymore
        if (curCornerMap.length === 0) {
            if (availShapesTurn.every((x) => x))
                this.placeOptions = this.getEmptyPlaceOptions();
            else
                this.placeOptions = [];
            return this.placeOptions;
        }

        this.placeOptions = [];

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
                        const tryPlace = new Placement(corner.target.sub(varCorner.pos), shape, varNum);
                        if (this.canPlace(tryPlace)) {
                            this.placeOptions.push(tryPlace);
                        }
                    }
                }
            }
        }

        return this.placeOptions;
    }

    public hasOptions(): [boolean, boolean] {
        const res: [boolean, boolean] = [false, false];

        pLoop:
        for (const pId of Player.Ids) {
            const availShapesTurn = this.availableShapes[pId];
            const curCornerMap = this.getCornerMap()[pId];

            if (curCornerMap.length === 0) {
                if (availShapesTurn.every((x) => x)) {
                    res[pId] = true; // a bit hacky for very small (unusual) fields
                    continue pLoop;
                } else {
                    res[pId] = false;
                    continue pLoop;
                }
            }

            for (let i = 0; i < Shape.AllShapes.length; i++) { // go over all available shapes
                if (!availShapesTurn[i])
                    continue;
                const shape = Shape.AllShapes[i];
                for (const corner of curCornerMap) { // go over all corner on the map
                    for (let varNum = 0; varNum < shape.Variants.length; varNum++) { // go over all variants
                        const variant = shape.Variants[varNum];
                        for (const varCorner of variant.Corners) { // go over all corner of that variant
                            if (!corner.diagMatch(varCorner.dir))
                                continue;
                            const tryPlace = new Placement(corner.target.sub(varCorner.pos), shape, varNum);
                            if (this.canPlace(tryPlace)) {
                                res[pId] = true;
                                continue pLoop;
                            }
                        }
                    }
                }
            }
        }
        return res;
    }

    private getEmptyPlaceOptions(): Placement[] {
        const emptyPlacement: Placement[] = [];
        const startPos = RuleSet.StartPos[this.turn];

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
}
