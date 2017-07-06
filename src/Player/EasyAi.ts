class EasyAi implements IPlayer {
    public static AiSteps = 2;
    private static readonly weightPiece: number = 3;
    private static readonly weightOpenCorner: number = 1;

    private static value(gameState: GameState, player: PlayerId): number {
        const curPlacedQbits = gameState.getPlacedQbits()[player];
        const nextCorner = gameState.getCornerMap();

        return nextCorner[player].length * EasyAi.weightOpenCorner
            - nextCorner[Util.otherPlayer(player)].length * EasyAi.weightOpenCorner
            + curPlacedQbits * EasyAi.weightPiece;
    }

    private static minmax(gameState: GameState, depth: number): Placement | undefined {
        if (depth === 0) {
            return undefined;
        } else {
            const options = gameState.getPlaceOption();
            let best: Placement | undefined;
            let score: number = -1;
            for (const opt of options) {
                const nextState = gameState.place(opt);
                const nextScore = this.minmax_scored(nextState, depth - 1, false, gameState.turn);
                if (nextScore > score) {
                    score = nextScore;
                    best = opt;
                }
            }
            return best;
        }
    }

    private static minmax_scored(gameState: GameState, depth: number, max: boolean, player: PlayerId): number {
        if (depth === 0) {
            return this.value(gameState, player);
        } else {
            const options = gameState.getPlaceOption();
            let score: number = max ? Number.MIN_VALUE : Number.MAX_VALUE;
            for (const opt of options) {
                const nextState = gameState.place(opt);
                const nextScore = this.minmax_scored(nextState, depth - 1, !max, player);
                if (max)
                    score = Math.max(nextScore, score);
                else
                    score = Math.min(nextScore, score);
            }
            return score;
        }
    }

    public readonly placeCallback = new Ev<Placement, never, never>();

    public display(gameState: GameState): void {
        console.log("Thinking!");
        const best: Placement | undefined = EasyAi.minmax(gameState, EasyAi.AiSteps);
        console.log("Done :P");
        this.placeCallback.invoke(best);
    }
}
