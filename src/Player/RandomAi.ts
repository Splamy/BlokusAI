/// <reference path="../Shape.ts"/>
/// <reference path="../GameState.ts"/>

class RandomAi implements IPlayer {
    private gameState: GameState;
    public readonly placeCallback = new Ev<(pos: Pos, shape: Shape, variant: number) => void>();

    display(gameState: GameState): void {
        this.gameState = gameState;
        const shape = Shape.AllShapes[Util.rndInt(0, RuleSet.ShapeCount)];
        const variant = Util.rndInt(0, shape.Variants.length);
        const pos = new Pos(
            Util.rndInt(0, RuleSet.GridSize - shape.Variants[variant][0].length),
            Util.rndInt(0, RuleSet.GridSize - shape.Variants[variant].length));
        this.placeCallback.invoke(pos, shape, variant);
    }
    currentState(): GameState { return this.gameState; }
}