/// <reference path="Enums/ShapeType.ts"/>
/// <reference path="ViewGrid.ts"/>
/// <reference path="Enums/CornerDir.ts"/>

class Shape {
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

    public static readonly AllShapes: Shape[] = [
        Shape.I1,
        Shape.I2,
        Shape.I3,
        Shape.I4,
        Shape.I5,
        Shape.L4,
        Shape.L5,
        /*Shape.V3,
        Shape.V5,
        Shape.T4,
        Shape.T5,
        Shape.Z4,
        Shape.Z5,
        Shape.N,
        Shape.U,
        Shape.Y,
        Shape.W,
        Shape.P,
        Shape.X,
        Shape.F,
        Shape.O,*/
    ];

    public static readonly ShapeCount: number = Shape.AllShapes.length;
    public static readonly QbitMax: number = Shape.AllShapes.reduce(
        (sum, sava) => sum + sava.Value, 0);

    private static getCornerMap(grid: boolean[][]): Corner[] {
        const corners: Corner[] = [];

        for (let y = 0; y < grid.length; y++) {
            const line = grid[y];
            for (let x = 0; x < line.length; x++) {
                const cell = line[x];
                if (!cell)
                    continue;
                const topEdge = y <= 0;
                const botEdge = y >= grid.length - 1;
                const leftEdge = x <= 0;
                const rightEdge = x >= line.length - 1;

                const yTop = topEdge || grid[y - 1][x] !== cell;
                const yBot = botEdge || grid[y + 1][x] !== cell;
                const yLeft = leftEdge || line[x - 1] !== cell;
                const yRight = rightEdge || line[x + 1] !== cell;

                if (yLeft) {
                    const yTopLeft = topEdge || leftEdge || !grid[y - 1][x - 1];
                    const yBotLeft = botEdge || leftEdge || !grid[y + 1][x - 1];

                    if ((topEdge && leftEdge) || (yTop && yTopLeft)) {
                        corners.push(new Corner(new Pos(x, y), CornerDir.TopLeft));
                    }
                    if ((botEdge && leftEdge) || (yBot && yBotLeft)) {
                        corners.push(new Corner(new Pos(x, y), CornerDir.BotLeft));
                    }
                }
                if (yRight) {
                    const yTopRight = topEdge || rightEdge || !grid[y - 1][x + 1];
                    const yBotRight = botEdge || rightEdge || !grid[y + 1][x + 1];

                    if ((topEdge && rightEdge) || (yTop && yTopRight)) {
                        corners.push(new Corner(new Pos(x, y), CornerDir.TopRight));
                    }
                    if ((botEdge && rightEdge) || (yBot && yBotRight)) {
                        corners.push(new Corner(new Pos(x, y), CornerDir.BotRight));
                    }
                }
            }
        }

        return corners;
    }

    private static getPieceCount(grid: boolean[][]): number {
        let count: number = 0;
        for (const line of grid) {
            for (const cell of line) {
                if (cell)
                    count++;
            }
        }
        return count;
    }

    public readonly Type: ShapeType;
    public readonly Value: number;
    // Inner array index [y][] is line
    // Outer array index [][x] is row
    public readonly Variants: {
        readonly Corners: Corner[],
        readonly Form: boolean[][],
        readonly Size: Pos,
    }[];

    constructor(type: ShapeType, form: boolean[][]) {
        this.Type = type;
        this.Variants = [];
        this.generateVariations(form);
        this.Value = Shape.getPieceCount(form);
    }

    public at(pos: Pos, variant: number, grip: Pos = Pos.Zero): Pos[] {
        const shape = this.Variants[variant].Form;
        const shapeArr: Pos[] = [];
        for (let y = 0; y < shape.length; y++) {
            const row = shape[y];
            for (let x = 0; x < row.length; x++) {
                if (row[x]) {
                    shapeArr.push(new Pos(pos.x + x - grip.x, pos.y + y - grip.y));
                }
            }
        }
        return shapeArr;
    }

    private generateVariations(baseForm: boolean[][]) {
        let curVariant = baseForm;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 4; j++) {
                let duplicate: boolean = false;
                for (const variant of this.Variants) {
                    if (ViewGrid.AreEqual(curVariant, variant.Form))
                        duplicate = true;
                    if (duplicate)
                        break;
                }

                if (!duplicate) {
                    const corners = Shape.getCornerMap(curVariant);
                    this.Variants.push({
                        Corners: corners,
                        Form: curVariant,
                        Size: new Pos(curVariant[0].length, curVariant.length),
                    });
                }

                curVariant = ViewGrid.RotateGrid(curVariant);
            }
            if (i === 0)
                curVariant = ViewGrid.FlipGrid(baseForm);
        }
    }
}
