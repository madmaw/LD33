function concentricGridFactory(): IGridFactory {

    return function (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number, difficulty: number, ringOffset: number): Grid {
        var grid = new Grid(width, height, true, 0);

        var y = height;
        var switchDelta = 0;
        var switchMod = Math.floor(height / difficulty);
        while (y > 0) {
            y--;
            var gaps = (height - y + ringOffset) + 1;
            var maxGapWidth = Math.max(1, Math.floor(width / (gaps * 4))*2);
            
            var gapWidth = Math.min(maxGapWidth, Math.max(1, Math.floor((y + difficulty + ringOffset) / 2)) * 2);
            var fullLength = Math.floor(width / gaps);
            // evenly space them as much as possible
            for (var x = 0; x < width; x++) {
                if ((x + Math.floor(gapWidth / 2) + switchDelta) % fullLength >= gapWidth) {
                    grid.setBlocked(x, y, Grid.BLOCKED_TOP, true);
                }
            }
            if ((y + ringOffset) % switchMod == 0 && y != 0) {
                switchDelta += Math.floor(width / 2);
            }
        }

        return grid;
    }

}