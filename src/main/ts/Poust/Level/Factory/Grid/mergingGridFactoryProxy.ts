function mergingGridFactoryProxy(proxies: IGridFactory[], splitHeight: number, difficultyDSplitHeight: number): IGridFactory {

    return function (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number, difficulty: number) {

        var grids: Grid[] = [];
        var adjustedSplitHeight = splitHeight + Math.floor(difficultyDSplitHeight * difficulty);
        var splits = Math.round(height / adjustedSplitHeight);
        var splitToX = toX;
        var splitToY = 0;
        var ringOffset = height;
        var previousSplitY = 0;
        for (var split = 0; split < Math.max(1, splits); split++) {
            var actualSplitHeight: number;
            var splitY: number;
            if (!splits) {
                splitY = height;
            } else {
                splitY = Math.floor(((split+1) * height) / splits);
            }
            actualSplitHeight = splitY - previousSplitY;
            previousSplitY = splitY;
            
            if (actualSplitHeight > 0) {
                ringOffset -= actualSplitHeight;
                var div = split + 1;
                var splitWidth = Math.ceil(width / div);
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
        return grid;
    }

}