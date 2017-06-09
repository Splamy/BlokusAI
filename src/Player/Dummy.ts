class Dummy implements IPlayer {
    public static Instance = new Dummy();
    public placeCallback = new Ev<Placement>();
    private constructor() { }
    // tslint:disable-next-line prefer-function-over-method
    public display(gameState: GameState): void {
        throw new Error("Method not implemented.");
    }
}
