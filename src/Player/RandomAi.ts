/// <reference path="../Shape.ts"/>
/// <reference path="../GameState.ts"/>

class RandomAi implements IPlayer {
    public readonly placeCallback = new Ev<Placement>();
    private gameState: GameState;

    public display(gameState: GameState): void {
        this.gameState = gameState;
        const shape = Util.pickRnd(Shape.AllShapes);
        const variant = Util.rndInt(0, shape.Variants.length);
        const pos = new Pos(
            Util.rndInt(0, RuleSet.GridSize - shape.Variants[variant].Form[0].length + 1),
            Util.rndInt(0, RuleSet.GridSize - shape.Variants[variant].Form.length + 1));
        this.placeCallback.invoke(new Placement(pos, shape, variant));
    }
    public currentState(): GameState { return this.gameState; }
}
