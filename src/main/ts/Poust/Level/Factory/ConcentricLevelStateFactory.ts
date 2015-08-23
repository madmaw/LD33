module Poust.Level.Factory {

    export class ConcentricLevelStateFactory {

        public constructor(
            private _element: Element,
            private _context: CanvasRenderingContext2D,
            private _gravity: number,
            private _rendererFactory: IEntityRendererFactory,
            private _maxCollisionSteps: number,
            private _entitySpawner: IEntitySpawner
        ) {

        }

        public createStateFactory(
            nextLevel: string,
            nextLevelDifficultyDelta: number,
            rings: number,
            ringWidth: number,
            ringGapPx: number,
            initialGap: number,
            ringGapIncrease: number
        ): IStateFactory {
            return (param: LevelStateFactoryParam) => {

                var level = new LevelState(
                    this._element,
                    param.player,
                    this._gravity,
                    this._context,
                    this._rendererFactory,
                    this._maxCollisionSteps
                    );

                var ring = 0;
                var radius = initialGap;
                var ringGap = ringGapPx;
                while (ring < rings) {

                     
                    var count = Math.max(1, ring);
                    var gapRadians = Math.max(Math.min(param.difficulty * Math.PI / 24 + Math.PI / 8, Math.PI / count), (ringGap + ringWidth) / radius);

                    var i = 0;
                    while (i < count) {
                        var ringEntity = new AbstractEntity(GroupId.Terrain);
                        var bounds: PolarBounds;
                        if (ring == 0) {
                            bounds = new PolarBounds(ringWidth, 0, initialGap, Math.PI * 2);
                        } else {
                            var arc = (Math.PI * 2 - (gapRadians * count)) / count;
                            var starta = (Math.PI * 2 * i) / count + gapRadians / 2;
                            bounds = new PolarBounds(radius, starta, ringWidth, arc);
                        }
                        bounds.normalize();
                        ringEntity._bounds = bounds;
                        level.addEntity(ringEntity);

                        var baddies = this._entitySpawner(bounds.getStartAngleRadians(), bounds.getOuterRadiusPx(), ringGap, bounds.getWidthRadians(), (param.difficulty * ring) / rings);
                        for (var j in baddies) {
                            var baddy = baddies[j];
                            level.addEntity(baddy);
                        }
                        i++;
                    }
                    radius += ringGap + ringWidth + ring * ringGapIncrease;

                    ring++;

                }

                // exit
                var exitHeight = 64;
                var exitWidth = exitHeight / radius;
                var exit = new Poust.Level.Entity.LevelExitEntity((player: Poust.Level.Entity.PlayerEntity) => {
                    return new Poust.Level.LevelStateFactoryParam(player, nextLevel, param.difficulty + nextLevelDifficultyDelta);
                });
                exit._bounds = new PolarBounds(radius, Math.random() * Math.PI * 2, exitHeight, exitWidth);
                exit._bounds.normalize();
                level.addEntity(exit);

                param.player.reset(initialGap + ringWidth + 2, 0);
                level.addEntity(param.player);

                return level;
            };

        }

    }

}