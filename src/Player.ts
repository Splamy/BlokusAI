/// <reference path="ShapeType.ts"/>
/// <reference path="RuleSet.ts"/>

class Player {
    public readonly AvailableForms: boolean[];

    constructor() {
        this.AvailableForms = new Array(RuleSet.ShapeCount);
    }
    reset() : void {
        for (var i = 0; i < RuleSet.ShapeCount; i++) {
            this.AvailableForms[i] = true;
        }
    }
};