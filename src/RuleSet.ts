/// <reference path="Shape.ts"/>

class RuleSet {
    public static GridSize: number = 14;
    public static StartPos: [Pos, Pos] = [Pos.Zero, Pos.Zero];
    public static NormalizeLongestSpace: number;
    public static NormalizeAccessSpace: number;
    public static NormalizeTrueLength: number;
    public static NormalizeOpenCorner: number;
    public static NormalizePiece: number;

    public static setGridSize(gridSize: number): void {
        RuleSet.GridSize = gridSize;
        RuleSet.NormalizeLongestSpace = gridSize * 2;
        RuleSet.NormalizeAccessSpace = gridSize * gridSize;
        RuleSet.NormalizeTrueLength = gridSize * 2;
        RuleSet.NormalizeOpenCorner = Shape.AllShapes.reduce(
            (sum, sava) => sum + sava.Variants[0].Corners.length, 0);
        RuleSet.NormalizePiece = Shape.AllShapes.reduce(
            (max, sava) => Math.max(max, sava.Value), -1);
        RuleSet.StartPos[PlayerId.p1] = new Pos(4, 4);
        RuleSet.StartPos[PlayerId.p2] = new Pos(gridSize - 5, gridSize - 5);
    }
}
