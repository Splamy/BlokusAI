/// <reference path="ShapeType.ts"/>
/// <reference path="RuleSet.ts"/>

abstract class IPlayer {
    protected view: IView;

    constructor(view: IView) {
        this.view = view;
    }
};

class Human extends IPlayer {
    constructor(view: IView, get: IAction) {
        super(view);
        const player = this;
        get.placeCallback = function (pos: Pos, shape: Shape, variant: number) { player.placeCallback(pos, shape, variant); };
    }

    private placeCallback(pos: Pos, shape: Shape, variant: number) {
        const state = this.view.currentState();
        const posArr = Shape.at(pos, shape.Variants[variant]);
        const newState = state.place(posArr, shape.Type);
        this.view.display(newState);
    }
}