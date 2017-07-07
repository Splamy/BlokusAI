class PosHash {
    private table: boolean[][] = [];

    public contains(pos: Pos): boolean {
        const row = this.table[pos.y];
        if (row !== undefined) {
            return row[pos.x] !== undefined;
        } else {
            return false;
        }
    }

    /**
     * Returns true if added, false if already was indexed.
     * @param pos The position to index.
     */
    public add(pos: Pos): boolean {
        let row = this.table[pos.y];
        if (row !== undefined) {
            if (row[pos.x] !== undefined)
                return false;
            else {
                row[pos.x] = true;
                return true;
            }
        } else {
            row = this.table[pos.y] = [];
            row[pos.x] = true;
            return true;
        }
    }

    public clear(): void {
        this.table = [];
    }
}
