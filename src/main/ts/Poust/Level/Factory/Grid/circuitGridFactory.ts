function circuitGridFactory(): IGridFactory {

    return function (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number): Grid {
        var grid = new Grid(width, height, true, Grid.BLOCKED_LEFT | Grid.BLOCKED_TOP);

        var isGood = function (x: number, y: number) {
            var f1 = grid.getFlag(x, y);
            var f2 = grid.getFlag(x + 1, y);
            var f3 = grid.getFlag(x, y + 1);
            var f4 = grid.getFlag(x + 1, y + 1);
            return !(f1 | f2 | f3 | f4);
            //return (!f1 || f1 == circuitNumber) && (!f2 || f2 == circuitNumber) && (!f3 || f3 == circuitNumber) && (!f4 || f4 == circuitNumber) && (!f1 || !f2 || !f3 || !f4);
        }

        var attempts = 0;
        var circuitNumber = 0;
        var maxLength = Math.min(width, height) * 2;
        while (attempts < Math.max(width, height)) {
            var length = 0;
            var x = Math.floor(rng() * (width - 1) / 2) * 2;
            var y = Math.floor(rng() * (height - 1) / 2) * 2;
            if (isGood(x, y)) {
                circuitNumber++;
                var first = true;
                var done = false;
                var previousDirection: number = null;
                while (!done) {
                    grid.setFlag(x, y, circuitNumber);
                    grid.setFlag(x + 1, y, circuitNumber);
                    grid.setFlag(x, y + 1, circuitNumber);
                    grid.setFlag(x + 1, y + 1, circuitNumber);
                    // begin
                    var nx: number;
                    var ny: number;
                    var directions = [Grid.UP, Grid.DOWN, Grid.LEFT, Grid.RIGHT];
                    directions.splice(previousDirection - 1, 1);
                    var direction: number;
                    var valid = false;
                    while (directions.length > 0) {
                        var index = Math.floor(rng() * directions.length);
                        direction = directions[index];
                        directions.splice(index, 1);
                        switch (direction) {
                            case Grid.UP:
                                nx = x;
                                ny = y - 2;
                                break;
                            case Grid.DOWN:
                                nx = x;
                                ny = y + 2;
                                break;
                            case Grid.LEFT:
                                nx = x - 2;
                                ny = y;
                                break;
                            case Grid.RIGHT:
                                nx = x + 2;
                                ny = y;
                                break;
                        }
                        if (nx >= 0 && nx < width - 1 && ny >= 0 && ny < height - 1 && isGood(nx, ny)) {
                            valid = true;
                            break;
                        }
                    }
                    if (valid && maxLength > length) {
                        switch (direction) {
                            case Grid.UP:
                                grid.setBlocked(x, y, Grid.UP, false);
                                grid.setBlocked(x + 1, y, Grid.UP, false);
                                if (previousDirection != Grid.LEFT) {
                                    grid.setBlocked(x + 1, y + 1, Grid.UP, false);
                                }
                                if (previousDirection != Grid.RIGHT) {
                                    grid.setBlocked(x, y + 1, Grid.UP, false);
                                }
                                //if (previousDirection != Grid.UP || true) {
                                    grid.setBlocked(x, y + 1, Grid.RIGHT, false);
                                //}
                                break;
                            case Grid.DOWN:
                                grid.setBlocked(x, y + 1, Grid.DOWN, false);
                                grid.setBlocked(x + 1, y + 1, Grid.DOWN, false);
                                if (previousDirection != Grid.LEFT) {
                                    grid.setBlocked(x + 1, y, Grid.DOWN, false);
                                }
                                if (previousDirection != Grid.RIGHT) {
                                    grid.setBlocked(x, y, Grid.DOWN, false);
                                }
                                //if (previousDirection != Grid.DOWN) {
                                    grid.setBlocked(x, y, Grid.RIGHT, false);
                                //}
                                break;
                            case Grid.LEFT:
                                grid.setBlocked(x, y, Grid.LEFT, false);
                                grid.setBlocked(x, y + 1, Grid.LEFT, false);
                                if (previousDirection != Grid.DOWN) {
                                    grid.setBlocked(x + 1, y, Grid.LEFT, false);
                                }
                                if (previousDirection != Grid.UP) {
                                    grid.setBlocked(x + 1, y + 1, Grid.LEFT, false);
                                }
                                
                                //if (previousDirection != Grid.LEFT) {
                                    grid.setBlocked(x + 1, y, Grid.DOWN, false);
                                //}
                                break;
                            case Grid.RIGHT:
                                grid.setBlocked(x + 1, y, Grid.RIGHT, false);
                                grid.setBlocked(x + 1, y + 1, Grid.RIGHT, false);
                                if (previousDirection != Grid.DOWN) {
                                    grid.setBlocked(x, y, Grid.RIGHT, false);
                                }
                                if (previousDirection != Grid.UP) {
                                    grid.setBlocked(x, y + 1, Grid.RIGHT, false);
                                }
                                //if (previousDirection != Grid.RIGHT) {
                                    grid.setBlocked(x, y, Grid.DOWN, false);
                                //}
                                break;
                        }
                        x = nx;
                        y = ny;
                    } else {
                        if (!first) {
                            switch (previousDirection) {
                                case Grid.UP:
                                    grid.setBlocked(x, y, Grid.RIGHT, false);
                                    grid.setBlocked(x, y, Grid.DOWN, false);
                                    grid.setBlocked(x+1, y, Grid.DOWN, false);
                                    break;
                                case Grid.DOWN:
                                    grid.setBlocked(x, y + 1, Grid.RIGHT, false);
                                    grid.setBlocked(x, y, Grid.DOWN, false);
                                    grid.setBlocked(x + 1, y, Grid.DOWN, false);
                                    break;
                                case Grid.LEFT:
                                    grid.setBlocked(x, y, Grid.DOWN, false);
                                    grid.setBlocked(x, y, Grid.RIGHT, false);
                                    grid.setBlocked(x, y+1, Grid.RIGHT, false);
                                    break;
                                case Grid.RIGHT:
                                    grid.setBlocked(x + 1, y, Grid.DOWN, false);
                                    grid.setBlocked(x, y, Grid.RIGHT, false);
                                    grid.setBlocked(x, y + 1, Grid.RIGHT, false);
                                    break;
                            }
                        } else {
                            // clear them all!!
                            grid.setBlocked(x + 1, y, Grid.LEFT, false);
                            grid.setBlocked(x, y + 1, Grid.UP, false);
                            grid.setBlocked(x + 1, y + 1, Grid.UP, false);
                            grid.setBlocked(x + 1, y + 1, Grid.LEFT, false);
                        }
                        done = true;
                    }
                    previousDirection = direction;
                    first = false;
                    length++;
                }
                attempts = 0;
            } else {
                attempts++;
            }

        }

        var flood = function (x: number, y: number, c: number): boolean {
            var f = grid.getFlag(x, y);
            if (!f) {
                grid.setFlag(x, y, c);
                if (x == 0) {
                    if (flood(width - 1, y, c)) {
                        grid.setBlocked(x, y, Grid.LEFT, false);
                    }
                } else {
                    if (flood(x - 1, y, c)) {
                        grid.setBlocked(x, y, Grid.LEFT, false);
                    }
                }
                if (flood((x + 1) % width, y, c)) {
                    grid.setBlocked(x, y, Grid.RIGHT, false);
                }
                if (y > 0) {
                    if (flood(x, y - 1, c)) {
                        grid.setBlocked(x, y, Grid.UP, false);
                    }
                }
                if (y < height - 1) {
                    if (flood(x, y + 1, c)) {
                        grid.setBlocked(x, y, Grid.DOWN, false);
                    }
                }
                return true;
            } else {
                return false;
            }
            

        }

        // clean up the rest
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var f = grid.getFlag(x, y);
                if (!f) {
                    circuitNumber++;
                    flood(x, y, circuitNumber);
                }
            }
        }

        // add in joins 
        var joinedCircuits: { [_: string]: boolean } = {};
        attempts = 0;
        while (attempts < width * height) {
            attempts++;
            var x = Math.floor(rng() * (width));
            var y = Math.floor(rng() * (height - 1));
            var c = grid.getFlag(x, y);
            var cr = grid.getFlag((x + 1)%width, y);
            var cd = grid.getFlag(x, y + 1);
            if (cr != c) {
                var s = "" + c + "-" + cr;
                if (!joinedCircuits[s]) {
                    grid.setBlocked(x, y, Grid.RIGHT, false);
                    joinedCircuits[s] = true;
                    attempts = 0;
                }
            }
            if (cd != c) {
                var s = "" + c + "-" + cd;
                if (!joinedCircuits[s]) {
                    grid.setBlocked(x, y, Grid.DOWN, false);
                    joinedCircuits[s] = true;
                    attempts = 0;
                }
            }
            
        }

        return grid;
    }

}