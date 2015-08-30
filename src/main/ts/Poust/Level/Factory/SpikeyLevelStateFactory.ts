function spikeyLevelStateFactory(
        element: Element,
        context: CanvasRenderingContext2D,
        gravity: number,
        rendererFactory: IEntityRendererFactory,
        maxCollisionSteps: number,
        entitySpawner: IEntitySpawner) {

    return function(
        nextLevel: string,
        nextLevelDifficultyDelta: number,
        spikes: number,
        groundOffset: number, 
        spikeHeight: number,
        spikeWidth: number
    ) : IStateFactory {
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

            var spike = 0;
            var floor = new AbstractEntity(GroupId.Terrain);
            floor._bounds = new PolarBounds(1, 0, groundOffset - 1, Math.PI * 2);
            level.addEntity(floor);

            var spikeDelta = (Math.PI) / spikes;

            while (spike < spikes) {
                spike++;

                var wall = new AbstractEntity(GroupId.Terrain);
                var a = spikeWidth / groundOffset;
                wall._bounds = new PolarBounds(groundOffset, (Math.PI * 2 * spike) / spikes - spikeDelta, spikeHeight, a);
                wall._bounds.normalize();
                level.addEntity(wall);
            }

            // exit
            var exitHeight = 64;
            var exitWidth = exitHeight / groundOffset;
            var exit = new LevelExitEntity((player: PlayerEntity) => {
                var result: ILevelStateFactoryParam = {
                    player: player,
                    levelName: nextLevel,
                    difficulty: param.difficulty + nextLevelDifficultyDelta
                };
                return result;
            });
            exit._bounds = new PolarBounds(groundOffset, Math.PI, exitHeight, exitWidth);
            exit._bounds.normalize();
            level.addEntity(exit);

            var apx = 0.22 + (Math.random() - 0.5) * 0.2;
            var r = groundOffset + 200 + (Math.random() - 0.5) * 40;
            apx = 0.22557467937469483;
            r = 505.3551623225212;
            console.log("apx " + apx);
            console.log("r " + r);

            param.player.reset(r, 0);
            param.player._velocityAPX = apx;
            level.addEntity(param.player);

            return level;
        }
    } 
}

