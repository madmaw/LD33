function mergingGridFactoryProxy(proxies: IGridFactory[], splitHeight: number): IGridFactory {

    return function (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number, difficulty: number) {

        var grids: Grid[] = [];
        var splits = Math.ceil(height / splitHeight);
        var splitToX = toX;
        var splitToY = 0;
        var ringOffset = height;
        for (var split = 0; split < splits; split++) {
            var actualSplitHeight = splitHeight;
            if (split == 0) {
                actualSplitHeight += height % splitHeight;
            }
            if (actualSplitHeight > 0) {
                ringOffset -= actualSplitHeight;
                var div = split + 1;
                var splitWidth = Math.max(1, Math.round(width / div));
                var splitFromX = Math.floor(rng() * splitWidth);
                var splitFromY = actualSplitHeight - 1;
                var proxied = proxies[Math.floor(rng() * proxies.length)];
                var grid = proxied(rng, splitWidth, actualSplitHeight, wrap, splitFromX, splitFromY, splitToX, splitToY, difficulty, ringOffset);
                if (split != 0) {
                    grid.setBlocked(splitToX, 0, Grid.UP, false);
                }
                grid = grid.stretch(width);
                grids.push(grid);
                splitToX = Math.floor((splitFromX * div) / (div + 1));
                splitToY = 0;
            }
        }
        // merge the grids 
        var grid = new Grid(width, height, wrap, 0);
        var y = 0;
        for (var i in grids) {
            var splitGrid = grids[i];
            grid.merge(splitGrid, 0, y);
            y += splitGrid._height;
        }
        /*
        var grid = proxied(width, height, wrap, fromX, fromY, toX, toY);

        for (var y = 0; y < grid._height; y++) {
            var minRoomSpan = Math.floor(y / div);
            var startX = Math.floor(Math.random() * grid._width);
            var count = 0;
            while (count < grid._width) {
                // find a pole (if any)
                while (count < grid._width) {
                    count++;
                    if (grid.isBlocked(startX, y, Grid.LEFT)) {
                        break;
                    } else {
                        startX = (startX + 1) % grid._width;
                    }
                }
                // pad out the room(s)
                var roomCount = 0;
                var x = startX;
                while (roomCount < minRoomSpan) {
                    x = (x + 1) % grid._width;
                    grid.setBlocked(x, y, Grid.LEFT, false);
                    roomCount++;
                    count++;
                }
            }
        }
        */
        return grid;
    }

}