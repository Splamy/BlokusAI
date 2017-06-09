/// <reference path="../Shape.ts"/>
/// <reference path="../GameState.ts"/>

class RandomAi implements IPlayer {
    public readonly placeCallback = new Ev<Placement>();

    public display(gameState: GameState): void {
        console.log("Thinking!");
        const options = gameState.getPlaceOption();
        console.log("Done :P");
        const pick = Util.pickRnd(options);
        this.placeCallback.invoke(pick);
    }
}
