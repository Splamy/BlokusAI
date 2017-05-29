/// <reference path="RuleSet.ts"/>
/// <reference path="Pos.ts"/>

interface IGridCell {
    pos: Pos;
    gridOwner: ViewGrid;
}

interface IView {
    display(gamestate: GameState): void;
    currentState(): GameState;
}

interface IAction {
    placeCallback: ((pos: Pos, shape: Shape, variant: number) => void);
}

class ViewGrid implements IView {
    private gridSize: Pos = Pos.Zero;
    private gamestate: GameState = null;
    private table: HTMLElement = null;
    private grid: HTMLElement[][] = null;
    private hoverPreview: Pos[] = null;
    public cbHover: (this: ViewGrid, pos: Pos) => void = null;
    public cbWheel: (this: ViewGrid, varDiff: number) => void = null;
    public cbClear: (this: ViewGrid) => void = null;
    public cbClick: (this: ViewGrid, pos: Pos) => void = null;

    public generate(width: number, height: number = width): HTMLElement {
        if (this.table !== null
            && width === this.gridSize.x && height === this.gridSize.y)
            return this.table;

        this.gridSize = new Pos(width, height);
        this.grid = [];
        this.table = document.createElement("div");

        this.table.classList.add("divTableBody");

        for (let y = 0; y < height; y++) {
            this.grid[y] = [];
            const row = document.createElement("div");
            row.classList.add("divTableRow");

            for (let x = 0; x < width; x++) {
                const cell = document.createElement("div");
                cell.onmouseenter = ViewGrid.cellEnter;
                cell.onmouseleave = ViewGrid.cellExit;
                cell.onmousewheel = ViewGrid.wheelRotate;
                cell.oncontextmenu = ViewGrid.rightClick;
                cell.onclick = ViewGrid.leftClick;
                cell.classList.add("divTableCell");
                const anycell: IGridCell = <any>cell;
                anycell.pos = new Pos(x, y);
                anycell.gridOwner = this;
                this.grid[y][x] = cell;
                row.appendChild(cell);
            }
            this.table.appendChild(row);
        }

        return this.table;
    }

    public clearHover(): void {
        if (this.hoverPreview !== null) {
            for (let i = 0; i < this.hoverPreview.length; i++) {
                var element = this.hoverPreview[i];
                Css.clearPlayerColor(this.grid[element.y][element.x].classList);
            }
            this.hoverPreview = null;
        }
    }

    public setHover(newHover: Pos[], player: PlayerId): void {
        if (this.hoverPreview === null) {
            this.hoverPreview = [];
        }
        for (let i = 0; i < newHover.length; i++) {
            var pos = newHover[i];
            if (pos.x < 0 || pos.x >= this.gridSize.x
                || pos.y < 0 || pos.y >= this.gridSize.y)
                continue;
            if (this.gamestate === null ||
                this.gamestate.gameGrid[pos.y][pos.x] === PlayerId.none) {
                this.grid[pos.y][pos.x].classList.add(Css.playerColor(player));
                this.hoverPreview.push(pos);
            }
        }
    }

    public display(gamestate: GameState): void {
        this.clearHover();
        this.gamestate = gamestate;

        for (let y = 0; y < this.gridSize.y; y++) {
            for (let x = 0; x < this.gridSize.x; x++) {
                this.grid[y][x].classList.add(Css.playerColor(this.gamestate.gameGrid[y][x]));
            }
        }
    }

    public currentState(): GameState { return this.gamestate; }

    private static cellEnter(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell.gridOwner === undefined || cell.gridOwner.cbHover === null)
            return;
        cell.gridOwner.cbHover(cell.pos);
    }

    private static cellExit(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell === undefined || cell.gridOwner.cbHover === null)
            return;
        cell.gridOwner.clearHover();
    }

    private static wheelRotate(this: HTMLElement, ev: WheelEvent): void {
        const cell: IGridCell = this as any;
        if (cell.gridOwner === undefined || cell.gridOwner.cbWheel === null)
            return;
        cell.gridOwner.cbWheel(ev.wheelDelta > 0 ? 1 : -1);
    }

    private static leftClick(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell === undefined || cell.gridOwner.cbClick === null)
            return;
        cell.gridOwner.cbClick(cell.pos);
    }

    private static rightClick(this: HTMLElement, ev: PointerEvent): boolean {
        const cell: IGridCell = this as any;
        if (cell.gridOwner === undefined || cell.gridOwner.cbClear === null)
            return;
        cell.gridOwner.cbClear();
        return false;
    }

    // apparently rotates clockwise
    public static RotateGrid<T>(grid: T[][]): T[][] {
        const ret: T[][] = [];
        for (let x = 0; x < grid[0].length; x++) {
            ret[x] = [];
            for (let y = 0; y < grid.length; y++) {
                ret[x][grid.length - y - 1] = grid[y][x];
            }
        }
        return ret;
    }

    public static FlipGrid<T>(grid: T[][]): T[][] {
        const ret: T[][] = [];
        for (let y = 0; y < grid.length; y++) {
            ret[y] = [];
            for (let x = 0; x < grid[0].length; x++) {
                ret[y][x] = grid[y][grid[0].length - x - 1];
            }
        }
        return ret;
    }

    public static AreEqual<T>(grid1: T[][], grid2: T[][]): boolean {
        if (grid1.length != grid2.length)
            return false;
        for (let y = 0; y < grid1.length; y++) {
            if (grid1[y].length != grid2[y].length)
                return false;
            for (let x = 0; x < grid1[y].length; x++) {
                if (grid1[y][x] !== grid2[y][x])
                    return false;
            }
        }
        return true;
    }

    public static gridAsString(grid: boolean[][]): string {
        let result: string = "\n";
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                result += grid[y][x] ? "X" : "_";
            }
            result += "\n";
        }
        return result;
    }

    public static generateGrid<T>(val: T, width: number, heigth: number = width): T[][] {
        const ret: T[][] = new Array(heigth);
        for (let y = 0; y < heigth; y++) {
            ret[y] = new Array(width);
            for (let x = 0; x < width; x++)
                ret[y][x] = val;
        }
        return ret;
    }

    public static cloneGrid<T>(original: T[][]): T[][] {
        const ret: T[][] = new Array(original.length);
        for (let y = 0; y < original.length; y++) {
            ret[y] = original[y].slice(0);
        }
        return ret;
    }
}