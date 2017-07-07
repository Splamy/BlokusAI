class DataTable {
    public static generateTable(gameState: GameState): [string, string] {
        const ret: [string, string] = ["", ""];
        const qbits = gameState.getPlacedQbits();
        const corner = gameState.getCornerMap(true);
        const space = EasyAi.get_space(gameState);
        for (const pId of Player.Ids) {
            ret[pId] += DataTable.generateRow("Bits", String(qbits[pId]));
            ret[pId] += DataTable.generateRow("Edges", String(corner[pId].length));
            ret[pId] += DataTable.generateRow("Space usage", String(space[pId]));
        }

        ret[gameState.turn] += DataTable.generateRow("Options", String(gameState.getPlaceOption().length));
        const other = gameState.place(undefined);
        ret[other.turn] += DataTable.generateRow("Options", String(other.getPlaceOption().length));
        return ret;
    }

    private static generateRow(name: string, value: string): string {
        return `<div><label>${name}:</label><output>${value}</output></div>`;
    }
}
