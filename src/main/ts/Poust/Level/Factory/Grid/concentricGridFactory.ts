function concentricGridFactory(): IGridFactory {

    return function (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number, difficulty: number, ringOffset: number): Grid {
        var grid = new Grid(width, height, true, 0);

        var y = height;
        var switchMod = Math.floor(height / difficulty);
        while (y > 0) {
            y--;
            var ring = height - y + ringOffset;
            var gaps = ring + 1;
            //var maxGapWidth = Math.max(1, Math.floor(width / (gaps * 4))*2);
            var maxGapWidth = Math.max(1, (width + difficulty) / (gaps * 3));
            var minGapWidth = Math.max(1, width / (gaps * 4));
            var gapWidth = minGapWidth + rng() * (maxGapWidth - minGapWidth);
            var fullLength = width / gaps;
            // evenly space them as much as possible
            var switchDelta = Math.floor(rng() * width);
            for (var x = 0; x < width; x++) {
                if (x % fullLength >= gapWidth) {
                    grid.setBlocked((x + switchDelta) % width, y, Grid.BLOCKED_TOP, true);
                }
            }
        }

        return grid;
    }

}