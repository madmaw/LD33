/// <reference path="src/main/ts/Poust/AbstractState.ts" />
/// <reference path="src/main/ts/Poust/AbstractUpdatingState.ts" />
/// <reference path="src/main/ts/Poust/Level/AbstractEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/AbstractPolarEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/AbstractCartesianEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/Gun/AbstractGun.ts" />
/// <reference path="src/main/ts/Poust/Level/Motion/PolarMotion.ts" />

//grunt-start
/// <reference path="src/main/ts/Poust/Engine.ts" />
/// <reference path="src/main/ts/Poust/IRandomNumberGenerator.ts" />
/// <reference path="src/main/ts/Poust/IRandomNumberGeneratorFactory.ts" />
/// <reference path="src/main/ts/Poust/ISound.ts" />
/// <reference path="src/main/ts/Poust/IState.ts" />
/// <reference path="src/main/ts/Poust/IStateFactory.ts" />
/// <reference path="src/main/ts/Poust/IStateListener.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/AbstractLivingPolarEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/BouncyEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/BulletEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/FlappyEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/IChomperEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/IGun.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/ILevelExitEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/IPlayerEntityTarget.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/ObstacleEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/PlayerEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Entity/SeekerEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/ConcentricLevelStateFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/DelegatingLevelStateFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/Grid.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/Grid/circuitGridFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/Grid/concentricGridFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/Grid/looseEndsTrimmingGridFactoryProxy.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/Grid/mazeGridFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/Grid/mergingGridFactoryProxy.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/HardCodedEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/IEntitySpawner.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/IEntitySpawnerFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/IGridFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/gridLevelStateFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Factory/hardCodedEntitySpawnerFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Gesture.ts" />
/// <reference path="src/main/ts/Poust/Level/GroupId.ts" />
/// <reference path="src/main/ts/Poust/Level/ICollision.ts" />
/// <reference path="src/main/ts/Poust/Level/IEntity.ts" />
/// <reference path="src/main/ts/Poust/Level/IEntityHolder.ts" />
/// <reference path="src/main/ts/Poust/Level/IEntityRenderer.ts" />
/// <reference path="src/main/ts/Poust/Level/IEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/ILevelStateData.ts" />
/// <reference path="src/main/ts/Poust/Level/ILevelStateFactoryParam.ts" />
/// <reference path="src/main/ts/Poust/Level/IMotion.ts" />
/// <reference path="src/main/ts/Poust/Level/LevelState.ts" />
/// <reference path="src/main/ts/Poust/Level/Motion/CartesianMotion.ts" />
/// <reference path="src/main/ts/Poust/Level/PolarBounds.ts" />
/// <reference path="src/main/ts/Poust/Level/PolarEdge.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/ageToScale.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/bouncyEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/chomperEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/exitEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/flappyEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/livingEntityRendererContext.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/pathEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/playerEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/seekerEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/Renderer/spikeEntityRendererFactory.ts" />
/// <reference path="src/main/ts/Poust/Level/loadLevelStateData.ts" />
/// <reference path="src/main/ts/Poust/Level/points.ts" />
/// <reference path="src/main/ts/Poust/Level/saveLevelStateData.ts" />
/// <reference path="src/main/ts/Poust/Menu/MenuState.ts" />
/// <reference path="src/main/ts/Poust/RNG/sinRandomNumberGeneratorFactory.ts" />
/// <reference path="src/main/ts/Poust/Sound/linearRampGain.ts" />
/// <reference path="src/main/ts/Poust/Sound/webAudioGunSoundFactory.ts" />
/// <reference path="src/main/ts/Poust/Sound/webAudioToneSoundFactory.ts" />
/// <reference path="src/main/ts/Poust/Sound/webAudioVibratoSoundFactory.ts" />
/// <reference path="src/main/ts/Poust/StateFactoryParamType.ts" />
/// <reference path="src/main/ts/Poust/toTimeString.ts" />
/// <reference path="src/main/ts/app.ts" />
/// <reference path="src/main/ts/levelNameToLevelStateFactoryParam.ts" />
/// <reference path="src/main/ts/math.ts" />
/// <reference path="src/main/d.ts/ga.d.ts" />
/// <reference path="src/main/d.ts/waa.d.ts" />
//grunt-end