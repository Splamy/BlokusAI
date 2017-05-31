/// <reference path="RuleSet.ts"/>
/// <reference path="Pos.ts"/>

interface IGridCell {
    pos: Pos;
    gridOwner: ViewGrid;
}

interface IView {
    display(gameState: GameState): void;
    currentState(): GameState;
}

interface IAction {
    placeCallback: Ev<Pos, Shape, number>;
}

class ViewGrid implements IView {
    public static getCornerMap(grid: PlayerId[][]): any {
        // TODO
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
        if (grid1.length !== grid2.length)
            return false;
        for (let y = 0; y < grid1.length; y++) {
            if (grid1[y].length !== grid2[y].length)
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
        for (const line of grid) {
            for (const cell of line) {
                result += cell ? "X" : "_";
            }
            result += "\n";
        }
        return result;
    }

    public static generateGrid<T>(val: T, width: number, heigth: number = width): T[][] {
        const ret: T[][] = new Array<T[]>(heigth);
        for (let y = 0; y < heigth; y++) {
            ret[y] = new Array<T>(width);
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

    private static cellEnter(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell.gridOwner === undefined)
            return;
        cell.gridOwner.cbHover.invoke(cell.gridOwner, cell.pos);
    }

    private static cellExit(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell.gridOwner === undefined || !cell.gridOwner.cbHover.isRegistered())
            return;
        // cell.gridOwner.cbClear.invoke(cell.gridOwner);
        cell.gridOwner.clearHover();
    }

    private static wheelRotate(this: HTMLElement, ev: WheelEvent): void {
        const cell: IGridCell = this as any;
        if (cell.gridOwner === undefined)
            return;
        cell.gridOwner.cbWheel.invoke(cell.gridOwner, ev.wheelDelta > 0 ? 1 : -1);
    }

    private static leftClick(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell === undefined)
            return;
        cell.gridOwner.cbClick.invoke(cell.gridOwner, cell.pos);
    }

    private static rightClick(this: HTMLElement, ev: PointerEvent): boolean {
        const cell: IGridCell = this as any;
        if (cell.gridOwner === undefined)
            return true;
        cell.gridOwner.cbClear.invoke(cell.gridOwner);
        return false;
    }

    public readonly cbHover = new Ev<ViewGrid, Pos>();
    public readonly cbWheel = new Ev<ViewGrid, number>();
    public readonly cbClear = new Ev<ViewGrid>();
    public readonly cbClick = new Ev<ViewGrid, Pos>();
    private gridSize: Pos = Pos.Zero;
    private gameState: GameState | null = null;
    private table: HTMLElement = document.createElement("div");
    private grid: HTMLElement[][] = [];
    private hoverPreview: Pos[] | null = null;

    constructor() {
        this.table.classList.add("divTableBody");
        this.grid = [];
    }

    public generate(width: number, height: number = width): HTMLElement {
        if (this.table !== null
            && width === this.gridSize.x && height === this.gridSize.y)
            return this.table;

        this.gridSize = new Pos(width, height);
        Util.clearChildren(this.table);
        Util.clearArray(this.grid);

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
                const anycell: IGridCell = cell as any;
                anycell.pos = new Pos(x, y);
                anycell.gridOwner = this;
                this.grid[y][x] = cell;
                row.appendChild(cell);
            }
            this.table.appendChild(row);
        }

        return this.table;
    }

    public clearHover(clean: boolean = false): void {
        if (clean) {
            for (const line of this.grid) {
                for (const cell of line) {
                    Css.clearPlayerColor(cell.classList);
                }
            }
        } else if (this.hoverPreview !== null) {
            for (const pos of this.hoverPreview) {
                Css.clearPlayerColor(this.grid[pos.y][pos.x].classList);
            }
            this.hoverPreview = null;
        }
    }

    public setHover(newHover: Pos[], player: PlayerId): void {
        if (this.hoverPreview === null) {
            this.hoverPreview = [];
        }
        for (const pos of newHover) {
            if (pos.x < 0 || pos.x >= this.gridSize.x
                || pos.y < 0 || pos.y >= this.gridSize.y)
                continue;
            if (this.gameState === null ||
                this.gameState.gameGrid[pos.y][pos.x] === PlayerId.none) {
                this.grid[pos.y][pos.x].classList.add(Css.playerColor(player));
                this.hoverPreview.push(pos);
            }
        }
    }

    public display(gameState: GameState): void {
        this.clearHover(true);
        this.gameState = gameState;

        for (let y = 0; y < this.gridSize.y; y++) {
            for (let x = 0; x < this.gridSize.x; x++) {
                this.grid[y][x].classList.add(Css.playerColor(this.gameState.gameGrid[y][x]));
            }
        }
    }

    // TODO: maby look for better unwrap check
    public currentState(): GameState { return this.gameState!; }
}
