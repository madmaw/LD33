function concentricLevelStateFactory(
        element: Element,
        context: CanvasRenderingContext2D,
        gravity: number,
        rendererFactory: IEntityRendererFactory,
        maxCollisionSteps: number,
        rngFactory: IRandomNumberGeneratorFactory,
        entitySpawnerFactory: IEntitySpawnerFactory
    ) {

    return function(
        nextLevel: string,
        nextLevelDifficultyDelta: number,
        baseRings: number,
        ringWidth: number,
        ringGapPx: number,
        initialGap: number,
        ringGapIncrease: number
        ): IStateFactory {

        return function (paramType: number, param: ILevelStateFactoryParam) {
            var rng = rngFactory(param.seed);
            var entitySpawner = entitySpawnerFactory(rng);
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

            var rings = baseRings + Math.round(param.difficulty / 2);

            var ring = 0;
            var radius = initialGap;
            var ringGap = ringGapPx;
            var ringSpacing: number = 0;

            var splits = Math.max(param.difficulty, 1);
            var splitMod = Math.max(1, Math.round(rings / splits));
            var splitOffset = 0;

            while (ring < rings) {

                if (ring != 0 && ring % splitMod == 0) {
                    splitOffset += pi;
                }
                     
                var count = ring+1;
                var gapRadians = Math.max(Math.min(param.difficulty * pi / 48 + pi / 8, pi / count), (ringGap + ringWidth) / radius);

                var i = 0;
                while (i < count) {
                    var ringEntity = new AbstractEntity(GroupId.Terrain);
                    var bounds: PolarBounds;
                    if (ring == 0) {
                        bounds = new PolarBounds(ringWidth, 0, initialGap, pi2);
                    } else {
                        var arc = (pi2 - (gapRadians * count)) / count;
                        var starta = (pi2 * i) / count + gapRadians / 2 + splitOffset;
                        bounds = new PolarBounds(radius, starta, ringWidth, arc);
                    }
                    ringEntity.bounds = bounds;
                    level.addEntity(ringEntity);

                    var baddies = entitySpawner(bounds.startAngleRadians, bounds.getOuterRadiusPx(), ringGap, bounds.widthRadians, Math.min(param.difficulty, (param.difficulty * ring) / rings));
                    for (var j in baddies) {
                        var baddy = baddies[j];
                        level.addEntity(baddy);
                    }
                    i++;
                }
                ringSpacing = ringGap + ringWidth + ring * (ringGapIncrease + param.difficulty * 2);
                radius += ringSpacing;

                ring++;

            }

            // exit
            var exitHeight = 64;
            var exitWidth = exitHeight / radius;
            var exit = createLevelExitEntity((player: PlayerEntity) => {
                return {
                    player: player,
                    levelName: nextLevel,
                    difficulty: param.difficulty + nextLevelDifficultyDelta
                };
            });
            exit.bounds = new PolarBounds(radius - ringSpacing / 2, rng() * pi2, exitHeight, exitWidth);
            level.addEntity(exit);

            param.player.reset(initialGap + ringWidth + 2, 0);
            level.addEntity(param.player);

            return level;
        };

    }

}
