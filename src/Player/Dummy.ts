class Dummy implements IView, IAction {
    public static Instance = new Dummy();
    public placeCallback = new Ev<Placement>();
    private constructor() { }
    // tslint:disable-next-line prefer-function-over-method
    public display(gameState: GameState): void {
        throw new Error("Method not implemented.");
    }
    // tslint:disable-next-line prefer-function-over-method
    public currentState(): GameState {
        throw new Error("Method not implemented.");
    }
}
