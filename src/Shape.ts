/// <reference path="ShapeType.ts"/>
/// <reference path="RuleSet.ts"/>

class Shape {
    public readonly Type: ShapeType;
    // Inner array index [y][] is line
    // Outer array index [][x] is row
    public readonly Form: boolean[][];
    public readonly Variants: boolean[][][];

    constructor(type: ShapeType, form: boolean[][]) {
        this.Type = type;
        this.Form = form;
        // TODO generate variants
    }

    public static readonly AllShapes: Shape[] = new Array(RuleSet.ShapeCount);

    public static initialize() : void {
        for (var i = 0; i < RuleSet.ShapeCount; i++) {
            var shape = Shape[ShapeType[i]]
            this.AllShapes[shape.Type] = shape;
        }
    }

    public static readonly I1 = new Shape(ShapeType.I1,
        [[true]]);

    public static readonly I2 = new Shape(ShapeType.I2,
        [[true, true]]);

    public static readonly I3 = new Shape(ShapeType.I3,
        [[true, true, true]]);

    public static readonly I4 = new Shape(ShapeType.I4,
        [[true, true, true, true]]);

    public static readonly I5 = new Shape(ShapeType.I5,
        [[true, true, true, true, true]]);

    public static readonly L4 = new Shape(ShapeType.L4,
        [[true, true, true],
        [true, false, false]]);

    public static readonly L5 = new Shape(ShapeType.L5,
        [[true, true, true, true],
        [true, false, false, false]]);

    public static readonly V3 = new Shape(ShapeType.V3,
        [[true, true],
        [false, true]]);

    public static readonly V5 = new Shape(ShapeType.V5,
        [[true, true, true],
        [false, false, true],
        [false, false, true]]);

    public static readonly T4 = new Shape(ShapeType.T4,
        [[true, true, true],
        [false, true, false]]);

    public static readonly T5 = new Shape(ShapeType.T5,
        [[true, true, true],
        [false, true, false],
        [false, true, false]]);

    public static readonly Z4 = new Shape(ShapeType.Z4,
        [[false, true, true],
        [true, true, false]]);

    public static readonly Z5 = new Shape(ShapeType.Z5,
        [[false, true, true],
        [false, true, false],
        [true, true, false]]);

    public static readonly N = new Shape(ShapeType.N,
        [[false, true, true, true],
        [true, true, false, false]]);

    public static readonly U = new Shape(ShapeType.U,
        [[true, false, true],
        [true, true, true]]);

    public static readonly Y = new Shape(ShapeType.Y,
        [[true, true, true, true],
        [false, true, false, false]]);

    public static readonly W = new Shape(ShapeType.W,
        [[true, false, false],
        [true, true, false],
        [false, true, true]]);

    public static readonly P = new Shape(ShapeType.P,
        [[true, true],
        [true, true],
        [true, false]]);

    public static readonly X = new Shape(ShapeType.X,
        [[false, true, false],
        [true, true, true],
        [false, true, false]]);

    public static readonly F = new Shape(ShapeType.F,
        [[false, true, false],
        [true, true, true],
        [true, false, false]]);

    public static readonly O = new Shape(ShapeType.O,
        [[true, true],
        [true, true]]);
}
