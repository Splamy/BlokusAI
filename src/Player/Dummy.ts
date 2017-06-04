class Dummy implements IView, IAction {
    public static Instance = new Dummy();
    public placeCallback = new Ev<Placement>();
    private constructor() { }
    public display(gameState: GameState): void {
        throw new Error("Method not implemented.");
    }
    public currentState(): GameState {
        throw new Error("Method not implemented.");
    }
}
