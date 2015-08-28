module Poust.Level.Factory {

    export class SkyscraperLevelStateFactory {

        constructor(
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
            numTowers: number, 
            floorHeight: number, 
            ceilingHeight: number,
            baseNumFloors: number, 
            groundOffset: number
            
        ): IStateFactory {

            return (param: LevelStateFactoryParam) => {

                var level = new LevelState(
                    this._element,
                    param.player,
                    this._gravity,
                    this._context,
                    this._rendererFactory,
                    this._maxCollisionSteps,
                    param.levelName,
                    param.difficulty
                    );

                var floor = new AbstractEntity(GroupId.Terrain);
                floor._bounds = new PolarBounds(floorHeight, 0, groundOffset - floorHeight, Math.PI * 2);
                level.addEntity(floor);

                var towerId = numTowers;

                while (towerId > 0) {

                    var floorId = 0;
                    var arc = (Math.PI) / numTowers;
                    var a = (Math.PI * 2 * towerId) / numTowers + arc / 2;
                    var r = groundOffset;
                    var numFloors = baseNumFloors + param.difficulty;
                    var floorCounts: { [_: number]: number } = {};
                    while (floorId < numFloors) {
                        floorId++;
                        var spawnA = a;
                        var spawnArc = arc;
                        if (floorId == towerId || Math.random() * 20 < param.difficulty) {
                            // add a wall!
                            var wallEntity = new AbstractEntity(GroupId.Terrain);
                            var wallArc = floorHeight / r;
                            wallEntity._bounds = new PolarBounds(r, a, ceilingHeight, wallArc);
                            wallEntity._bounds.normalize();
                            level.addEntity(wallEntity);
                            spawnA += wallArc;
                            spawnArc -= wallArc;
                        }
                        if (numFloors - floorId == towerId || Math.random() * 20 < param.difficulty) {
                            // add a wall!
                            var wallEntity = new AbstractEntity(GroupId.Terrain);
                            var wallArc = floorHeight / r;
                            wallEntity._bounds = new PolarBounds(r, a + arc - wallArc, ceilingHeight, wallArc);
                            wallEntity._bounds.normalize();
                            level.addEntity(wallEntity);
                            spawnArc -= wallArc;
                        }
                        r += ceilingHeight;
                        var entities = this._entitySpawner(spawnA, r + floorHeight, ceilingHeight, spawnArc, Math.min(param.difficulty, (floorId * param.difficulty * 2) / numFloors));
                        var floorCount = floorCounts[floorId];
                        if (floorCount == null) {
                            floorCount = 0;
                        }
                        if ((Math.random() * 100) < param.difficulty * (numTowers - floorCount) && floorId > 1) {
                            // add an extra ceiling
                            var bonusFloorEntity = new AbstractEntity(GroupId.Terrain);
                            bonusFloorEntity._bounds = new PolarBounds(r, a + arc, floorHeight, arc);
                            bonusFloorEntity._bounds.normalize();
                            level.addEntity(bonusFloorEntity);
                            floorCount++;
                            floorCounts[floorId] = floorCount;
                        }
                        if ((Math.random() * 100) > 3) {
                            for (var k in entities) {
                                var entity = entities[k];
                                level.addEntity(entity);
                            }
                            var floorEntity = new AbstractEntity(GroupId.Terrain);
                            floorEntity._bounds = new PolarBounds(r, a, floorHeight, arc);
                            floorEntity._bounds.normalize();
                            level.addEntity(floorEntity);
                        } 


                        r += floorHeight;
                    }

                    towerId--;
                }

                var radius = (ceilingHeight + floorHeight) * numFloors + groundOffset;

                // exit
                var exitHeight = 64;
                var exitWidth = exitHeight / radius;
                var exit = new Poust.Level.Entity.LevelExitEntity((player: Poust.Level.Entity.PlayerEntity) => {
                    return new Poust.Level.LevelStateFactoryParam(player, nextLevel, param.difficulty + nextLevelDifficultyDelta);
                });
                exit._bounds = new PolarBounds(radius, Math.random() * Math.PI * 2, exitHeight, exitWidth);
                exit._bounds.normalize();
                level.addEntity(exit);


                param.player.reset(groundOffset + 2, 0);
                level.addEntity(param.player);


                return level;

            }

        }

    }

}