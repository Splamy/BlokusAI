/// <reference path="ShapeType.ts"/>
/// <reference path="RuleSet.ts"/>

interface IPlayer {
    play: ((pos: Pos, shape: Shape, variant: number) => void);

    newGameState(gamestate: GameState) : void;
};

class Human implements IPlayer {
    play: (pos: Pos, shape: Shape, variant: number) => void;

    constructor() {
        
    }

    newGameState(gamestate: GameState): void {
        
    }
}