/// <reference path="RuleSet.ts"/>

class Pos {
    public readonly x: number;
    public readonly y: number;

    public static readonly Zero: Pos = new Pos(0, 0);

    constructor(x: number, y: number) {
        this.x = x; this.y = y;
    }
}

interface IGridCell {
    pos: Pos;
    gridOwner: ViewGrid;
}

class ViewGrid {
    public static instance: ViewGrid = new ViewGrid();
    private gridSize: Pos = Pos.Zero;
    private table: HTMLElement = null;
    private grid: HTMLElement[][] = null;
    private hoverPreview: Pos[] = null;
    public hoverset: ((pos: Pos) => Pos[]) = null;

    public static reloadGlobalGrid(): void {
        const grid = ViewGrid.instance.generate(RuleSet.GridSize);
        const game = document.getElementById("game");
        while (game.firstChild) {
            game.removeChild(game.firstChild);
        }
        game.appendChild(grid);
    }

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
                this.grid[element.y][element.x].classList.remove("qhover");
            }
            this.hoverPreview = null;
        }
    }

    public setHover(newHover: Pos[]): void {
        if (this.hoverPreview === null) {
            this.hoverPreview = [];
        }
        for (let i = 0; i < newHover.length; i++) {
            var pos = newHover[i];
            if (pos.x < 0 || pos.x >= this.gridSize.x
                || pos.y < 0 || pos.y >= this.gridSize.y
                || this.grid[pos.y][pos.x].classList.contains("qhover"))
                continue;
            this.grid[pos.y][pos.x].classList.add("qhover");
            this.hoverPreview.push(pos);
        }
    }

    private static cellEnter(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell === undefined || cell.gridOwner.hoverset === null)
            return;
        cell.gridOwner.clearHover();
        const newPrev = cell.gridOwner.hoverset(cell.pos);
        if (newPrev !== null) {
            cell.gridOwner.setHover(newPrev);
        }
    }

    private static cellExit(this: HTMLElement, ev: MouseEvent): void {
        const cell: IGridCell = this as any;
        if (cell === undefined || cell.gridOwner.hoverset === null)
            return;
        cell.gridOwner.clearHover();
    }

    public display(gamestate: any): void {

    }
}