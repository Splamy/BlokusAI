var ShapeType;
(function (ShapeType) {
    ShapeType[ShapeType["I1"] = 0] = "I1";
    ShapeType[ShapeType["I2"] = 1] = "I2";
    ShapeType[ShapeType["I3"] = 2] = "I3";
    ShapeType[ShapeType["I4"] = 3] = "I4";
    ShapeType[ShapeType["I5"] = 4] = "I5";
    ShapeType[ShapeType["L4"] = 5] = "L4";
    ShapeType[ShapeType["L5"] = 6] = "L5";
    ShapeType[ShapeType["V3"] = 7] = "V3";
    ShapeType[ShapeType["V5"] = 8] = "V5";
    ShapeType[ShapeType["T4"] = 9] = "T4";
    ShapeType[ShapeType["T5"] = 10] = "T5";
    ShapeType[ShapeType["Z4"] = 11] = "Z4";
    ShapeType[ShapeType["Z5"] = 12] = "Z5";
    ShapeType[ShapeType["N"] = 13] = "N";
    ShapeType[ShapeType["U"] = 14] = "U";
    ShapeType[ShapeType["Y"] = 15] = "Y";
    ShapeType[ShapeType["W"] = 16] = "W";
    ShapeType[ShapeType["P"] = 17] = "P";
    ShapeType[ShapeType["X"] = 18] = "X";
    ShapeType[ShapeType["F"] = 19] = "F";
    ShapeType[ShapeType["O"] = 20] = "O";
})(ShapeType || (ShapeType = {}));
var RuleSet = (function () {
    function RuleSet() {
    }
    return RuleSet;
}());
RuleSet.GridSize = 14;
RuleSet.ShapeCount = 21;
/// <reference path="ShapeType.ts"/>
/// <reference path="RuleSet.ts"/>
var Shape = (function () {
    function Shape(type, form) {
        this.Type = type;
        this.Form = form;
        // TODO generate variants
    }
    Shape.initialize = function () {
        for (var i = 0; i < RuleSet.ShapeCount; i++) {
            var shape = Shape[ShapeType[i]];
            this.AllShapes[shape.Type] = shape;
        }
    };
    return Shape;
}());
Shape.AllShapes = new Array(RuleSet.ShapeCount);
Shape.I1 = new Shape(ShapeType.I1, [[true]]);
Shape.I2 = new Shape(ShapeType.I2, [[true, true]]);
Shape.I3 = new Shape(ShapeType.I3, [[true, true, true]]);
Shape.I4 = new Shape(ShapeType.I4, [[true, true, true, true]]);
Shape.I5 = new Shape(ShapeType.I5, [[true, true, true, true, true]]);
Shape.L4 = new Shape(ShapeType.L4, [[true, true, true],
    [true, false, false]]);
Shape.L5 = new Shape(ShapeType.L5, [[true, true, true, true],
    [true, false, false, false]]);
Shape.V3 = new Shape(ShapeType.V3, [[true, true],
    [false, true]]);
Shape.V5 = new Shape(ShapeType.V5, [[true, true, true],
    [false, false, true],
    [false, false, true]]);
Shape.T4 = new Shape(ShapeType.T4, [[true, true, true],
    [false, true, false]]);
Shape.T5 = new Shape(ShapeType.T5, [[true, true, true],
    [false, true, false],
    [false, true, false]]);
Shape.Z4 = new Shape(ShapeType.Z4, [[false, true, true],
    [true, true, false]]);
Shape.Z5 = new Shape(ShapeType.Z5, [[false, true, true],
    [false, true, false],
    [true, true, false]]);
Shape.N = new Shape(ShapeType.N, [[false, true, true, true],
    [true, true, false, false]]);
Shape.U = new Shape(ShapeType.U, [[true, false, true],
    [true, true, true]]);
Shape.Y = new Shape(ShapeType.Y, [[true, true, true, true],
    [false, true, false, false]]);
Shape.W = new Shape(ShapeType.W, [[true, false, false],
    [true, true, false],
    [false, true, true]]);
Shape.P = new Shape(ShapeType.P, [[true, true],
    [true, true],
    [true, false]]);
Shape.X = new Shape(ShapeType.X, [[false, true, false],
    [true, true, true],
    [false, true, false]]);
Shape.F = new Shape(ShapeType.F, [[false, true, false],
    [true, true, true],
    [true, false, false]]);
Shape.O = new Shape(ShapeType.O, [[true, true],
    [true, true]]);
var Util = (function () {
    function Util() {
    }
    Util.preventDefault = function (e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    };
    Util.preventDefaultForScrollKeys = function (e) {
        if (Util.keys[e.keyCode]) {
            Util.preventDefault(e);
            return false;
        }
    };
    Util.disableScroll = function () {
        if (window.addEventListener)
            window.addEventListener('DOMMouseScroll', Util.preventDefault, false);
        window.onwheel = Util.preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = Util.preventDefault; // older browsers, IE
        window.ontouchmove = Util.preventDefault; // mobile
        document.onkeydown = Util.preventDefaultForScrollKeys;
    };
    Util.enableScroll = function () {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', Util.preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    };
    return Util;
}());
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
Util.keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
/// <reference path="Shape.ts"/>
/// <reference path="Util.ts"/>
window.onload = function () {
    Shape.initialize();
    ViewGrid.reloadGlobalGrid();
    console.log(Shape.AllShapes);
};
function newGame(ev) {
    var sizeSelector = document.getElementById("newGame_size");
    RuleSet.GridSize = parseInt(sizeSelector.value);
    ViewGrid.reloadGlobalGrid();
}
/// <reference path="ShapeType.ts"/>
/// <reference path="RuleSet.ts"/>
var Player = (function () {
    function Player() {
        this.AvailableForms = new Array(RuleSet.ShapeCount);
    }
    Player.prototype.reset = function () {
        for (var i = 0; i < RuleSet.ShapeCount; i++) {
            this.AvailableForms[i] = true;
        }
    };
    return Player;
}());
;
/// <reference path="RuleSet.ts"/>
var ViewGrid = (function () {
    function ViewGrid() {
        this.gridSize = -1;
        this.table = undefined;
        this.grid = undefined;
    }
    ViewGrid.reloadGlobalGrid = function () {
        var grid = ViewGrid.instance.generate();
        var game = document.getElementById("game");
        while (game.firstChild) {
            game.removeChild(game.firstChild);
        }
        game.appendChild(grid);
    };
    ViewGrid.prototype.generate = function () {
        if (this.table !== undefined && RuleSet.GridSize === this.gridSize)
            return this.table;
        this.grid = [];
        this.table = document.createElement("div");
        this.table.classList.add("divTableBody");
        for (var y = 0; y < RuleSet.GridSize; y++) {
            this.grid[y] = [];
            var row = document.createElement("div");
            row.classList.add("divTableRow");
            for (var x = 0; x < RuleSet.GridSize; x++) {
                var cell = document.createElement("div");
                cell.onmouseenter = ViewGrid.cellEnter;
                cell.onmouseleave = ViewGrid.cellExit;
                cell.classList.add("divTableCell");
                var anycell = cell;
                anycell.x = x;
                anycell.y = y;
                this.grid[y][x] = cell;
                row.appendChild(cell);
            }
            this.table.appendChild(row);
        }
        return this.table;
    };
    ViewGrid.cellEnter = function (ev) {
        this.classList.add("qhover");
    };
    ViewGrid.cellExit = function (ev) {
        this.classList.remove("qhover");
    };
    ViewGrid.prototype.display = function (gamestate) {
    };
    return ViewGrid;
}());
ViewGrid.instance = new ViewGrid();
//# sourceMappingURL=game.js.map