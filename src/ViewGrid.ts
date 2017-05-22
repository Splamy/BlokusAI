/// <reference path="RuleSet.ts"/>

class ViewGrid {
    public static instance: ViewGrid = new ViewGrid();
    private gridSize: number = -1;
    private table: HTMLElement = undefined;
    private grid: HTMLElement[][] = undefined;
    public hoverset: (x: number, y: number) => void;

    public static reloadGlobalGrid(): void {
        const grid = ViewGrid.instance.generate();
        const game = document.getElementById("game");
        while (game.firstChild) {
            game.removeChild(game.firstChild);
        }
        game.appendChild(grid);
    }

    public generate(): HTMLElement {
        if (this.table !== undefined && RuleSet.GridSize === this.gridSize)
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
                const anycell: any = cell;
                anycell.x = x;
                anycell.y = y;
                this.grid[y][x] = cell;
                row.appendChild(cell);
            }
            this.table.appendChild(row);
        }

        return this.table;
    }

    private static cellEnter(this: HTMLElement, ev: MouseEvent) {
        this.classList.add("qhover");
    }

    private static cellExit(this: HTMLElement, ev: MouseEvent) {
        this.classList.remove("qhover");
    }

    public display(gamestate: any): void {

    }
}