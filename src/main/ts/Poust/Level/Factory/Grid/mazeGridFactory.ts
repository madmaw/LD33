function mazeGridFactory(gapProbability: number): IGridFactory {
    var processedFlag = 1;

    return function (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number) {
        var grid = new Grid(width, height, wrap, Grid.BLOCKED_TOP | Grid.BLOCKED_LEFT);


        var step = function (x: number, y: number, previousVertical: boolean) {
            grid.setFlag(x, y, processedFlag);
            var directions: number[] = [Grid.LEFT, Grid.RIGHT];
            if (!previousVertical) {
                directions.push(Grid.UP);
                directions.push(Grid.DOWN); 
            }
            while (directions.length) {
                var i = Math.floor(rng() * directions.length);
                var direction = directions[i];
                directions.splice(i, 1);
                var nx: number;
                var ny: number;
                var skip = false;
                var vertical = false;
                switch (direction) {
                    case Grid.UP:
                        nx = x;
                        ny = y - 1;
                        vertical = true;
                        break;
                    case Grid.DOWN:
                        nx = x;
                        ny = y + 1;
                        vertical = true;
                        break;
                    case Grid.LEFT:
                        nx = x - 1;
                        ny = y;
                        break;
                    case Grid.RIGHT:
                        nx = x + 1;
                        ny = y;
                        break;
                }
                if (nx < 0) {
                    skip = !wrap;
                    nx += width;
                }
                if (nx >= width) {
                    skip = !wrap;
                    nx = nx % width;
                }
                if (ny < 0 || ny >= height) {
                    skip = true;
                }
                if (!skip) {
                    var processed = grid.getFlag(nx, ny);
                    if (!processed) {
                        grid.setBlocked(x, y, direction, false);
                        step(nx, ny, vertical);
                    } else {
                        if (rng() < gapProbability) {
                            // break the wall anyway!
                            grid.setBlocked(x, y, direction, false);
                        }
                    }

                }
            }
        }
        step(fromX, fromY, false);

        return grid;
    }
}