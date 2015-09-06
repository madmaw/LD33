function gridLevelStateFactory(
    element: Element,
    context: CanvasRenderingContext2D,
    gravity: number,
    rendererFactory: IEntityRendererFactory,
    maxCollisionSteps: number,
    rngFactory: IRandomNumberGeneratorFactory,
    entitySpawnerFactory: IEntitySpawnerFactory,
    maxRingGap: number
    ) {

    return function (
        nextLevel: string,
        nextLevelDifficultyDelta: number,
        initialRadius: number,
        baseWidth: number, 
        baseHeight: number,
        difficultyScaleWidth: number,
        difficultyScaleHeight: number,
        ringWidth: number,
        ringGapPx: number,
        ringGapDelta: number, 
        ringGapDeltaScale: number,
        gridFactory: IGridFactory
    ): IStateFactory {

        return function (paramType: number, param: ILevelStateFactoryParam) {
            var rng = rngFactory(param.seed);
            var width = baseWidth + Math.round(param.difficulty * difficultyScaleWidth);
            var height = baseHeight + Math.round(param.difficulty * difficultyScaleHeight);

            var level = new LevelState(
                element,
                param.player,
                gravity,
                context,
                rendererFactory,
                maxCollisionSteps,
                param.levelName,
                param.difficulty
                );

            var fromx = 0;
            var fromy = height - 1;

            var tox = Math.floor(width / 2);
            var toy = 0;

            var grid = gridFactory(rng, width, height, true, 0, 0, tox, toy, param.difficulty, 0);
            var entitySpawner = entitySpawnerFactory(rng);
            // open up the exit
            grid.setBlocked(tox, toy, Grid.UP, false);

            var aoff = pi / width;
            // turn the grid into a level
            var rs: number[] = [];
            var y = grid._height;
            var r = initialRadius;
            var rgd = 0;
            rs.push(initialRadius);
            while (y > 0) {
                var ring = height - y;
                r += Math.min(ringGapPx + ringWidth + rgd, maxRingGap);
                rgd += (ringGapDelta + ringGapDeltaScale * param.difficulty) * (ring + 1);
                rs.splice(0, 0, r);
                y--;
            }

            // measure the column sequences
            for (var ix = 0; ix < grid._width; ix++) {
                var count = 0;
                for (var iy = grid._height; iy > 0;) {
                    iy--;
                    if (grid.isBlocked(ix, iy, Grid.LEFT)) {
                        var mix = ix - 1;
                        if (mix < 0) {
                            mix += grid._width;
                        }
                        var blockedLeft = grid.isBlocked(ix, iy, Grid.DOWN);
                        var blockedRight = grid.isBlocked(mix, iy, Grid.DOWN);

                        if (blockedLeft && blockedRight) {
                            count = 1;
                        } else {
                            count++;
                        }

                    } else {
                        count = 0;
                    }
                    grid.setFlag(ix, iy, count);
                }
                var maxCount = 0;
                for (var iy = 0; iy < grid._height; iy++) {
                    var count = grid.getFlag(ix, iy);
                    maxCount = Math.max(count, maxCount);
                    if (count == 1) {
                        // create it
                        //var r = initialRadius + (grid._height - (iy + 1)) * (ringGapPx + ringWidth);
                        var r = rs[iy+1];

                        var arc = ringWidth / r;
                        var a = (ix * pi2) / grid._width - arc / 2 + aoff;
                        //var h = (ringGapPx + ringWidth) * maxCount - ringWidth;
                        var h = rs[iy - maxCount + 1] - r - ringWidth;
                        var wall = new AbstractEntity(GroupId.Terrain);
                        wall._bounds = new PolarBounds(r, a, h, arc);
                        level.addEntity(wall);                            

                        maxCount = 0;
                    }

                }
            }

            var y = grid._height;
            while (y > 0) {
                var ring = height - y;
                y--;
                r = rs[y];

                // find a gap to start x at
                var x = 0;
                while (x < grid._width && grid.isBlocked(x, y, Grid.UP)) {
                    x++;
                }
                var initialX = x;
                var done = false;
                var startX = initialX % grid._width;
                var steps = 0;
                while (!done) {
                    while (steps <= grid._width && !grid.isBlocked(startX, y, Grid.UP)) {
                        startX = (startX + 1) % grid._width;
                        steps++;
                    }
                    x = startX;
                    while (x < startX + grid._width && grid.isBlocked(x % grid._width, y, Grid.UP)) {
                        x++;
                        steps++;
                    }
                    if (steps <= grid._width) {
                        var a = (startX * pi2) / grid._width + aoff;
                        var arc = ((x - startX) * pi2) / grid._width;

                        // add on some length for walls
                        var leftFlagBelow = grid.getFlag(startX % grid._width, y);
                        var leftFlagAbove = grid.getFlag(startX % grid._width, y - 1);
                        var rightFlagBelow = grid.getFlag(x % grid._width, y);
                        var rightFlagAbove = grid.getFlag(x % grid._width, y - 1);

                        // work out where we're basing our ring
                        var cr: number;
                        if (leftFlagBelow >= leftFlagAbove) {
                            //cr = r - (leftFlagBelow) * (ringGapPx + ringWidth);
                            cr = rs[y + leftFlagBelow];
                        } else {
                            //cr = r  - (leftFlagAbove - 1) * (ringGapPx + ringWidth);
                            cr = rs[y + leftFlagAbove - 1];
                        }
                        var ca = ringWidth / cr;
                        if (leftFlagAbove > 0 && leftFlagBelow > 0) {
                            a += ca/2;
                            arc -= ca/2;
                        } else {
                            a -= ca / 2;
                            arc += ca / 2;
                        }
                        if (rightFlagBelow >= rightFlagAbove) {
                            //cr = r - (rightFlagBelow) * (ringGapPx + ringWidth);
                            cr = rs[y + rightFlagBelow];
                        } else {
                            //cr = r - (rightFlagAbove - 1) * (ringGapPx + ringWidth);
                            cr = rs[y + rightFlagAbove - 1];
                        }
                        var ca = ringWidth / cr;
                        if (rightFlagAbove > 0 && rightFlagBelow > 0) {
                            arc -= ca/2;
                        } else {
                            arc += ca / 2;
                        }

                        var terrain = new AbstractEntity(GroupId.Terrain);
                        terrain._bounds = new PolarBounds(r - ringWidth, a, ringWidth, arc);
                        level.addEntity(terrain);

                        var maxHeight: number;
                        if (y == 0) {
                            maxHeight = initialRadius;
                        } else {
                            maxHeight = rs[y - 1] - r - ringWidth;
                        }
                        var baddies = entitySpawner(a, r, maxHeight, arc, Math.sqrt((param.difficulty * ring * 2) / height));
                        for (var j in baddies) {
                            var baddy = baddies[j];
                            level.addEntity(baddy);
                        }


                        startX = x % grid._width;
                    } else {
                        done = true;
                    }
                }
            }

            var floor = new AbstractEntity(GroupId.Terrain);
            floor._bounds = new PolarBounds(0, 0, initialRadius, pi2);
            level.addEntity(floor);

            // exit
            var exitR = r + ringWidth;
            var exitHeight = 64;
            var exitWidth = exitHeight / exitR;
            var exit = createLevelExitEntity((player: PlayerEntity) => {
                return {
                    player: player,
                    levelName: nextLevel,
                    difficulty: param.difficulty + nextLevelDifficultyDelta
                };
            });
            exit._bounds = new PolarBounds(exitR, rng() * pi2, exitHeight, exitWidth);
            level.addEntity(exit);


            param.player.reset(initialRadius + 2, 0);
            level.addEntity(param.player);

            return level;
        }
    }
}