function concentricLevelStateFactory(
        element: Element,
        context: CanvasRenderingContext2D,
        gravity: number,
        rendererFactory: IEntityRendererFactory,
        maxCollisionSteps: number,
        entitySpawner: IEntitySpawner
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

        return (paramType: number, param: ILevelStateFactoryParam) => {

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

            var rings = baseRings + param.difficulty;

            var ring = 0;
            var radius = initialGap;
            var ringGap = ringGapPx;
            var ringSpacing: number = 0;

            var splits = Math.max(param.difficulty, 1);
            var splitMod = Math.max(1, Math.round(rings / splits));
            var splitOffset = 0;

            while (ring < rings) {

                if (ring != 0 && ring % splitMod == 0) {
                    splitOffset += Math.PI;
                }
                     
                var count = ring+1;
                var gapRadians = Math.max(Math.min(param.difficulty * Math.PI / 48 + Math.PI / 8, Math.PI / count), (ringGap + ringWidth) / radius);

                var i = 0;
                while (i < count) {
                    var ringEntity = new AbstractEntity(GroupId.Terrain);
                    var bounds: PolarBounds;
                    if (ring == 0) {
                        bounds = new PolarBounds(ringWidth, 0, initialGap, Math.PI * 2);
                    } else {
                        var arc = (Math.PI * 2 - (gapRadians * count)) / count;
                        var starta = (Math.PI * 2 * i) / count + gapRadians / 2 + splitOffset;
                        bounds = new PolarBounds(radius, starta, ringWidth, arc);
                    }
                    bounds.normalize();
                    ringEntity._bounds = bounds;
                    level.addEntity(ringEntity);

                    var baddies = entitySpawner(bounds.getStartAngleRadians(), bounds.getOuterRadiusPx(), ringGap, bounds.getWidthRadians(), Math.min(param.difficulty, (param.difficulty * ring * 2) / rings));
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
            var exit = new LevelExitEntity((player: PlayerEntity) => {
                return {
                    player: player,
                    levelName: nextLevel,
                    difficulty: param.difficulty + nextLevelDifficultyDelta
                };
            });
            exit._bounds = new PolarBounds(radius - ringSpacing / 2, Math.random() * Math.PI * 2, exitHeight, exitWidth);
            exit._bounds.normalize();
            level.addEntity(exit);

            param.player.reset(initialGap + ringWidth + 2, 0);
            level.addEntity(param.player);

            return level;
        };

    }

}
