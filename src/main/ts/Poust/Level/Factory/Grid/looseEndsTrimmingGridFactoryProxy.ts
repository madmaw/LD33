function looseEndsTrimmingGridFactoryProxy(proxied: IGridFactory): IGridFactory {
    return function (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number, difficulty: number, ringOffet: number) {
        var grid = proxied(rng, width, height, wrap, fromX, fromY, toX, toY, difficulty, ringOffet);

        // remove any vertical hanging ends
        for (var x = 0; x < grid._width; x++) {
            for (var y = 0; y < grid._height; y++) {
                if (grid.isBlocked(x, y, Grid.RIGHT)) {
                    var ceiling = grid.isBlocked(x, y, Grid.UP);
                    if (x < grid._width - 1 || grid._wrap) {
                        ceiling = ceiling || grid.isBlocked((x + 1) % grid._width, y, Grid.UP);
                    }
                    if (y > 0) {
                        ceiling = ceiling || grid.isBlocked(x, y - 1, Grid.RIGHT);
                    } else {
                        ceiling = true;
                    }
                    if (!ceiling) {
                        grid.setBlocked(x, y, Grid.RIGHT, false);
                    }
                }
            }
        }


        return grid;
    }
}