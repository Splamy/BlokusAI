/// <reference path="RuleSet.ts"/>

class Pos {
    public readonly x: number;
    public readonly y: number;

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
    private gridSize: number = -1;
    private table: HTMLElement = null;
    private grid: HTMLElement[][] = null;
    private hoverPreview: Pos[] = null;
    public hoverset: ((pos: Pos) => Pos[]) = null;

    public static reloadGlobalGrid(): void {
        const grid = ViewGrid.instance.generate();
        const game = document.getElementById("game");
        while (game.firstChild) {
            game.removeChild(game.firstChild);
        }
        game.appendChild(grid);
    }

    public generate(): HTMLElement {
        if (this.table !== null && RuleSet.GridSize === this.gridSize)
            return this.table;

        this.grid = [];
        this.table = document.createElement("div");
        this.table.classList.add("divTableBody");

        for (let y = 0; y < RuleSet.GridSize; y++) {
            this.grid[y] = [];
            const row = document.createElement("div");
            row.classList.add("divTableRow");

            for (let x = 0; x < RuleSet.GridSize; x++) {
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

    private clearHover(): void {
        if (this.hoverPreview !== null) {
            for (let i = 0; i < this.hoverPreview.length; i++) {
                var element = this.hoverPreview[i];
                this.grid[element.y][element.x].classList.remove("qhover");
            }
            this.hoverPreview = null;
        }
    }

    private setHover(newHover: Pos[]): void {
        if (this.hoverPreview === null) {
            this.hoverPreview = [];
        }
        for (let i = 0; i < newHover.length; i++) {
            var pos = newHover[i];
            if (pos.x < 0 || pos.x >= RuleSet.GridSize
                || pos.y < 0 || pos.y >= RuleSet.GridSize
                || this.grid[pos.y][pos.x].classList.contains("qhover"))
                continue;
            this.grid[pos.y][pos.x].classList.add("qhover");
            this.hoverPreview.push(pos);
        }
    }

    private static cellEnter(this: HTMLElement, ev: MouseEvent): void {
        const cell = (<any>this) as IGridCell;
        if (cell === undefined || cell.gridOwner.hoverset === null)
            return;
        cell.gridOwner.clearHover();
        const newPrev = cell.gridOwner.hoverset(cell.pos);
        if (newGame !== null) {
            cell.gridOwner.setHover(newPrev);
        }
    }

    private static cellExit(this: HTMLElement, ev: MouseEvent): void {
        const cell = (<any>this) as IGridCell;
        if (cell === undefined || cell.gridOwner.hoverset === null)
            return;
        cell.gridOwner.clearHover();
    }

    public display(gamestate: any): void {

    }
}