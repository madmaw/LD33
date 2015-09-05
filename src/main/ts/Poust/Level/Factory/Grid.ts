class Grid {

    public static BLOCKED_TOP = 1;
    public static BLOCKED_LEFT = 2;

    public static UP = 1;
    public static DOWN = 2;
    public static LEFT = 3;
    public static RIGHT = 4;

    private _grid: number[][];

    constructor(public _width: number, public _height: number, public _wrap: boolean, value: number) {
        var grid = new Array<number[]>();
        for (var x = 0; x < _width; x++) {
            var column = new Array<number>();
            for (var y = 0; y < _height; y++) {
                column.push(value);
            }
            grid.push(column);
        }
        this._grid = grid;
    }

    public getFlag(x: number, y: number): number {
        var f = this._grid[x][y];
        return f >> 2;
    }

    public setFlag(x: number, y: number, flag: number): void {
        var f = flag << 2;
        this._grid[x][y] = (this._grid[x][y] & (Grid.BLOCKED_LEFT | Grid.BLOCKED_TOP)) | f;
    }

    public merge(grid: Grid, lx: number, ly: number) {
        for (var x = 0; x < grid._width; x++) {
            for (var y = 0; y < grid._height; y++) {
                this._grid[lx + x][ly + y] = grid._grid[x][y];
            }
        }
    }

    public stretch(width: number): Grid {
        var grid = new Grid(width, this._height, this._wrap, 0);
        for (var y = 0; y < this._height; y++) {
            var tx = 0;
            for (var x = 0; x < this._width; x++) {
                // work out the number of cells to stretch this to
                var cells = Math.floor(((x + 1) * width) / this._width) - Math.floor((x * width) / this._width);
                for (var i = 0; i < cells; i++) {
                    var mask: number;
                    if (i == 0) {
                        mask = Grid.BLOCKED_LEFT | Grid.BLOCKED_TOP;
                    } else {
                        mask = Grid.BLOCKED_TOP;
                    }
                    grid._grid[tx][y] = this._grid[x][y] & mask;
                    tx++;
                }
            }
        }
        return grid;
    }

    public setBlocked(x: number, y: number, direction: number, blocked: boolean): void {
        var valid = false;
        var mx: number;
        var my: number;
        var value: number;
        switch (direction) {
            case Grid.UP:
                if (y >= 0) {
                    valid = true;
                    mx = x;
                    my = y;
                    value = Grid.BLOCKED_TOP;
                }
                break;
            case Grid.DOWN:
                if (y < this._height - 1) {
                    valid = true;
                    mx = x;
                    my = y + 1;
                    value = Grid.BLOCKED_TOP;
                }
                break;
            case Grid.LEFT:
                if (x >= 0) {
                    valid = true;
                    mx = x;
                    my = y;
                    value = Grid.BLOCKED_LEFT;
                }
                break;
            case Grid.RIGHT:
                if (x < this._width - 1 || this._wrap) {
                    valid = true;
                    mx = (x + 1) % this._width;
                    my = y;
                    value = Grid.BLOCKED_LEFT;
                }
                break;
        }
        if (blocked) {
            this._grid[mx][my] = this._grid[mx][my] | value;
        } else {
            this._grid[mx][my] = this._grid[mx][my] & ~value;
        }

    }

    public isBlocked(x: number, y: number, direction: number): boolean {
        var result: boolean;
        switch (direction) {
            case Grid.UP:
                if (y < 0) {
                    result = true;
                } else {
                    result = (this._grid[x][y] & Grid.BLOCKED_TOP) != 0;
                }
                break;
            case Grid.DOWN:
                if (y >= this._height - 1) {
                    result = true;
                } else {
                    result = (this._grid[x][y + 1] & Grid.BLOCKED_TOP) != 0;
                }
                break;
            case Grid.LEFT:
                if (x <= 0 && !this._wrap) {
                    result = true;
                } else {
                    result = (this._grid[x][y] & Grid.BLOCKED_LEFT) != 0;
                }
                break;
            case Grid.RIGHT:
                if (x >= this._width - 1 && !this._wrap) {
                    result = true;
                } else {
                    result = (this._grid[(x + 1) % this._width][y] & Grid.BLOCKED_LEFT) != 0;
                }
                break;
            default:
                result = true;
                break;
        }
        return result;
    }

}