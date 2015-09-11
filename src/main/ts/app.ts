var _w = window;

_w.onload = () => {

    var levelStateElement = document.getElementById("c");
    var menuStateElement = document.getElementById("m");

    var audioContext: AudioContext;
    if (_w["AudioContext"]) {
        audioContext = new AudioContext();
//    } else if (_w["webkitAudioContext"]) {
//        audioContext = new webkitAudioContext();
    }

    var sawtooth = 'sawtooth';
    var square = 'square';

    var jumpSound = webAudioToneSoundFactory(audioContext, sawtooth, 250, 1000, 400, 0.01, 0.08, 0.12, 0.3);
    var shootSound1 = webAudioToneSoundFactory(audioContext, square, 600, 100, 100, 0, 0.03, 0.04, 0.2, 0.6);
    var shootSound = webAudioBoomSoundFactory(audioContext, shootSound1, 0.25);
    var playerDeathSound = webAudioVibratoSoundFactory(audioContext, 200, 10, 6, 0.7);
    var wallJumpAvailableSound = webAudioToneSoundFactory(audioContext, square, 250, -150, 100, 0, 0.05, 0.1, 0.2, 0.5);
    var monsterDeathSound = webAudioToneSoundFactory(audioContext, sawtooth, 300, -100, 100, 0.01, 0.05, 0.1, 0.3);
    var winSound = webAudioVibratoSoundFactory(audioContext, 600, 1000, 14, 0.8);
    var fallSound1 = webAudioToneSoundFactory(audioContext, sawtooth, 500, 150, 200, 0.05, 0.1, 0.3, 1)
    var fallSound = webAudioBoomSoundFactory(audioContext, fallSound1, 1.5);

    var canvas = <HTMLCanvasElement>levelStateElement;
    var context = canvas.getContext("2d");

    var rgba = function (r, g, b, a) {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    };

    var f = function (g: CanvasGradient, alpha: number) {
        g.addColorStop(0, rgba(255, 0, 255, alpha));
        //g.addColorStop(0.1, rgba(255, 0, 255, alpha));
        g.addColorStop(0.2, rgba(255, 0, 0, alpha));
        g.addColorStop(0.4, rgba(255, 255, 0, alpha));
        g.addColorStop(0.6, rgba(128, 255, 0, alpha ));
        //g.addColorStop(0.7, rgba(0, 255, 255,  alpha ));
        g.addColorStop(0.8, rgba(0, 128, 255, alpha));
        g.addColorStop(1, rgba(255, 255, 255, alpha));
    };
    var radialGradient = context.createRadialGradient(0, 0, 0, 0, 0, 2000);
    f(radialGradient, 0.6);

    var enemyGradient = context.createRadialGradient(0, 0, 500, 0, 0, 2500);
    f(enemyGradient, 0.8);

    //var backgroundGradient = context.createLinearGradient(0, -2000, 0, 0);
    var backgroundGradient = context.createRadialGradient(0, 0, 500, 0, 0, 2500);
    f(backgroundGradient, 0.25);
    
    var white = "#FFF";
    var terrainRenderer = terrainEntityRendererFactory(2, white, radialGradient);
    var flappyRenderer = flappyEntityRendererFactory(2, white, enemyGradient);
    var spikeRenderer = spikeEntityRendererFactory(2, white, rgba(255, 255, 255, 0.9));
    var bouncyRenderer = bouncyEntityRendererFactory(2, white, enemyGradient);
    var seekerRenderer = seekerEntityRendererFactory(2, white, enemyGradient);
    var exitRenderer = exitEntityRendererFactory(2, white, enemyGradient);
    var playerRenderer = playerEntityRendererFactory(2, white, rgba(255, 0, 0, 1), rgba(208, 192, 0, 1));
    var bulletRenderer = seekerEntityRendererFactory(2, "#FFA", rgba(255, 255, 0, 0.7));
    var chomperRenderer = chomperEntityRendererFactory(2, white, enemyGradient);
    var bloodRenderer = seekerEntityRendererFactory(2, white, enemyGradient);
    var renderers: { [_: number]: IEntityRenderer } = {};
    renderers[ENTITY_TYPE_ID_TERRAIN] = terrainRenderer;
    renderers[ENTITY_TYPE_ID_FLAPPY] = flappyRenderer;
    renderers[ENTITY_TYPE_ID_SPIKE] = spikeRenderer;
    renderers[ENTITY_TYPE_ID_BOUNCY] = bouncyRenderer;
    renderers[ENTITY_TYPE_ID_SEEKER] = seekerRenderer;
    renderers[ENTITY_TYPE_ID_EXIT] = exitRenderer;
    renderers[ENTITY_TYPE_ID_PLAYER] = playerRenderer;
    renderers[ENTITY_TYPE_ID_BULLET] = bulletRenderer;
    renderers[ENTITY_TYPE_ID_CHOMPER] = chomperRenderer;
    renderers[ENTITY_TYPE_ID_BLOOD] = bloodRenderer;
    var entityRendererFactory = hardCodedEntityRendererFactory(renderers);

    var level1 = "1";
    var level2 = "2";
    var level3 = "3";
    var level4 = "4";

    var gravity = 0.0014;
    var maxCollisionSteps = 6;

    var entitySpawnerFactory = hardCodedEntitySpawnerFactory(monsterDeathSound);

    var rngFactory = sinRandomNumberGeneratorFactory();

    //var _concentricLevelStateFactory = concentricLevelStateFactory(levelStateElement, context, gravity, entityRendererFactory, maxCollisionSteps, rngFactory, entitySpawnerFactory);
    var _gridLevelStateFactory = gridLevelStateFactory(levelStateElement, context, gravity, entityRendererFactory, maxCollisionSteps, rngFactory, entitySpawnerFactory, 170, fallSound, backgroundGradient);

    var _circuitGridFactory = circuitGridFactory();
    var _mazeGridFactory = mazeGridFactory(0.03);
    var _concentriGridFactory = concentricGridFactory();

    var levelStateFactories: { [_: string]: IStateFactory } = {};
    //levelStateFactories[level1] = _concentricLevelStateFactory(level2, 0, 4, 20, 70, 300, 5);
    levelStateFactories[level1] = _gridLevelStateFactory(level2, 0, 250, 28, 1, 2, 1, 30, 0, 70, 10, 1, 20000, 2000, 8000, _concentriGridFactory);
    levelStateFactories[level2] = _gridLevelStateFactory(level3, 0, 350, 14, 1, 3, 1, 20, 20, 85, 5, 1, 20000, 7000, 7000, looseEndsTrimmingGridFactoryProxy(mergingGridFactoryProxy([_mazeGridFactory], 3, 0)));
    levelStateFactories[level3] = _gridLevelStateFactory(level4, 0, 600, 18, 3, 4, 1, 25, 60, 90, 2, 0.5, 60000, 0, 8000, mergingGridFactoryProxy([_circuitGridFactory], 4.1, 0));
    levelStateFactories[level4] = _gridLevelStateFactory(level1, 1, 400, 14, 2, 4, 1, 20, 40, 75, 3, 1, 40000, 5000, 6000, mergingGridFactoryProxy([_concentriGridFactory, _mazeGridFactory, _circuitGridFactory], 3.2, 0.2));

    var menuState = new MenuState(menuStateElement, "l", levelStateFactories);
    

    var _delegatingLevelStateFactory = delegatingLevelStateFactory(
        levelStateFactories,
        menuState,
        level1,
        jumpSound,
        shootSound,
        playerDeathSound,
        winSound,
        wallJumpAvailableSound);

    var engine = new Engine(_delegatingLevelStateFactory);

    var locationToLevel = function () {
        var hash = location.hash;
        var param: any;
        if (hash) {
            // attempt to load a specific level
            hash = hash.substr(1);
            var levelStateFactoryParam = levelNameToLevelStatFactoryParam(hash);
            if (levelStateFactoryParam) {
                var data = loadLevelStateData(levelStateFactoryParam.difficulty, levelStateFactoryParam.levelName);
                if (data) {
                    paramType = StateFactoryParamType.LevelLoad;
                    param = levelStateFactoryParam;
                } else {
                    param = null;
                }
            } else {
                param = null;
            }
        }
        return param;
    
    };

    var param = locationToLevel();
    var paramType: number;
    if (!param) {
        paramType = StateFactoryParamType.LevelRestart;
    } else {
        var hash = location.hash;
        var oldURL = location.href;
        var newURL = location.href.substr(0, location.href.length - hash.length);
        // replace with menu/home screen (then we load a level, so it goes on top of this, so back always goes back!)
        history.replaceState(null, null, newURL);
        history.pushState(null, null, oldURL);
    }

    engine.setStateFromParam(paramType, param);

    _w.onpopstate = (event: PopStateEvent) => {
        var state = event.state;
        if (!state) {
            state = locationToLevel();
        }
        if (state) {
            // load it!
            engine.setStateFromParam(StateFactoryParamType.LevelLoad, state);
        } else {
            // restart!
            // TODO menu
            engine.setStateFromParam(StateFactoryParamType.LevelRestart, null);
        }
    }


};