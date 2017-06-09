class EasyAi implements IPlayer {
    private static readonly weightPiece: number = 3;
    private static readonly weightOpenCorner: number = 1;

    public readonly placeCallback = new Ev<Placement, never, never>();

    public display(gameState: GameState): void {
        console.log("Thinking!");
        const curPlacedQbits = gameState.getPlacedQbits()[gameState.turn];

        const options = gameState.getPlaceOption();
        let best: Placement | undefined;
        let score: number = -1;
        for (const opt of options) {
            const nextState = gameState.place(opt);
            const nextCorner = nextState.getCornerMap();
            const nextPieceCnt = curPlacedQbits + opt.shape.Value;

            const nextScore =
                nextCorner[gameState.turn].length * EasyAi.weightOpenCorner
                - nextCorner[Util.otherPlayer(gameState.turn)].length * EasyAi.weightOpenCorner
                + nextPieceCnt * EasyAi.weightPiece;
            if (nextScore > score) {
                score = nextScore;
                best = opt;
            }
        }
        console.log("Done :P");
        this.placeCallback.invoke(best);
    }
}
