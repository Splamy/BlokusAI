/// <reference path="../Shape.ts"/>
/// <reference path="../GameState.ts"/>

class RandomAi implements IPlayer {
    public readonly placeCallback = new Ev<Pos, Shape, number>();
    private gameState: GameState;

    public display(gameState: GameState): void {
        this.gameState = gameState;
        const rnd = Util.rndInt(0, RuleSet.ShapeCount);
        const shape = Shape.AllShapes[rnd];
        const variant = Util.rndInt(0, shape.Variants.length);
        const pos = new Pos(
            Util.rndInt(0, RuleSet.GridSize - shape.Variants[variant][0].length + 1),
            Util.rndInt(0, RuleSet.GridSize - shape.Variants[variant].length + 1));
        this.placeCallback.invoke(pos, shape, variant);
    }
    public currentState(): GameState { return this.gameState; }
}
