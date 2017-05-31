interface IPlayer extends IView, IAction { }

class Dummy implements IView, IAction {
    public static Instance = new Dummy();
    public placeCallback = new Ev<Pos, Shape, number>();
    private constructor() {

    }
    public display(gameState: GameState): void {
        throw new Error("Method not implemented.");
    }
    public currentState(): GameState {
        throw new Error("Method not implemented.");
    }
}
