/// <reference path="Shape.ts"/>

class RuleSet {
    public static GridSize: number = 14;

    public static setGridSize(gridSize: number): void {
        RuleSet.GridSize = gridSize;
        RuleSet.NormalizeLongestSpace = gridSize * 2;
        RuleSet.NormalizeAccessSpace = gridSize * gridSize;
        RuleSet.NormalizeTrueLength = gridSize * 2;
        RuleSet.NormalizeOpenCorner = Shape.AllShapes.reduce(
            (sum, sava) => sum + sava.Variants[0].Corners.length, 0);
        RuleSet.NormalizePiece = Shape.AllShapes.reduce(
            (max, sava) => Math.max(max, sava.Variants[0].Corners.length), Number.NEGATIVE_INFINITY);
    }

    public static NormalizeLongestSpace: number;
    public static NormalizeAccessSpace: number;
    public static NormalizeTrueLength: number;
    public static NormalizeOpenCorner: number;
    public static NormalizePiece: number;
}
