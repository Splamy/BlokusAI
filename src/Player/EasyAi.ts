class EasyAi implements IPlayer {
    private static readonly weightPiece: number = 1;
    private static readonly weightOpenCorner: number = 1;

    public readonly placeCallback = new Ev<Placement, never, never>();
    private gameState: GameState;

    public display(gameState: GameState): void {
        this.gameState = gameState;
        console.log("Thinking!");
        const curPlacedPieces = gameState.availableShapes[gameState.turn].reduce(
            (sum, sava, ix) => sava ? sum + Shape.AllShapes[ix].Value : sum, 0);

        const options = gameState.getPlaceOption();
        let best: Placement | undefined;
        let score: number = -1;
        for (const opt of options) {
            const nextState = gameState.place(opt);
            const nextCorner = nextState.getCornerMap();
            const nextPieceCnt = curPlacedPieces + opt.shape.Value;

            const nextScore =
                nextCorner[gameState.turn].length * EasyAi.weightOpenCorner
                + nextPieceCnt * EasyAi.weightPiece;
            if (nextScore > score) {
                score = nextScore;
                best = opt;
            }
        }
        console.log("Done :P");
        this.placeCallback.invoke(best);
    }
    public currentState(): GameState { return this.gameState; }
}