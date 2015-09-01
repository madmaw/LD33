

window.onload = () => {

    var e = document.getElementById("canvas");

    var audioContext: AudioContext;
    if (window["AudioContext"]) {
        audioContext = new AudioContext();
    } else if (window["webkitAudioContext"]) {
        audioContext = new webkitAudioContext();
    }

    var jumpSound = webAudioToneSoundFactory(audioContext, 'sawtooth', 250, 1000, 200, 0.01, 0.08, 0.12, 0.3);
    var shootSound1 = webAudioToneSoundFactory(audioContext, 'square', 600, 100, 100, 0, 0.035, 0.04, 0.2, 0.6);
    var shootSound = webAudioGunSoundFactory(audioContext, shootSound1);
    var playerDeathSound = webAudioVibratoSoundFactory(audioContext, 200, 10, 6, 0.7);
    var wallJumpAvailableSound = webAudioToneSoundFactory(audioContext, 'square', 250, -150, 100, 0, 0.05, 0.1, 0.2, 0.5);
    var monsterDeathSound = webAudioToneSoundFactory(audioContext, 'sawtooth', 150, -100, 100, 0.01, 0.05, 0.1, 0.3);
    var winSound = webAudioVibratoSoundFactory(audioContext, 600, 1000, 14, 0.8);

    var canvas = <HTMLCanvasElement>e;
    canvas.setAttribute("width", ""+document.body.clientWidth+"px");
    canvas.setAttribute("height", ""+document.body.clientHeight+"px");
    var context = canvas.getContext("2d");
    var f = function (g: CanvasGradient, alpha: number) {
        g.addColorStop(0, "rgba(0, 0, 0, "+alpha+")");
        g.addColorStop(0.2, "rgba(255, 0, 255, " + alpha +")");
        g.addColorStop(0.32, "rgba(255, 0, 0, " + alpha +")");
        g.addColorStop(0.44, "rgba(255, 255, 0, " + alpha +")");
        g.addColorStop(0.56, "rgba(0, 255, 0, " + alpha +")");
        g.addColorStop(0.68, "rgba(0, 255, 255, " + alpha +")");
        g.addColorStop(0.8, "rgba(0, 0, 255, " + alpha +")");
        g.addColorStop(0.92, "rgba(255, 255, 255, 0.7)");
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
    };
    var radialGradient = context.createRadialGradient(0, 0, 0, 0, 0, 1500);
    f(radialGradient, 0.5);

    var enemyGradient = context.createRadialGradient(0, 0, 200, 0, 0, 1700);
    f(enemyGradient, 0.75);
    

    var defaultRenderer = pathEntityRendererFactory(2, "#FFFFFF", radialGradient);
    var flappyRenderer = flappyEntityRendererFactory(2, "#FFFFFF", enemyGradient);
    var spikeRenderer = spikeEntityRendererFactory(2, "#FFFFFF", "rgba(255, 255, 255, 0.8)");
    var bouncyRenderer = bouncyEntityRendererFactory(2, "#FFFFFF", enemyGradient);
    var seekerRenderer = seekerEntityRendererFactory(2, "#FFFFFF", enemyGradient);
    var exitRenderer = exitEntityRendererFactory(2, "#FFFFFF", enemyGradient);
    var playerRenderer = playerEntityRendererFactory(2, "#FFFFFF", "rgba(255, 0, 0, 1)", "rgba(128, 128, 0, 1)");
    var bulletRenderer = seekerEntityRendererFactory(2, "#FFFFAA", "rgba(255, 255, 0, 0.7)");
    var chomperRenderer = chomperEntityRendererFactory(2, "#FFFFFF", enemyGradient);
    var entityRendererFactory = hardCodedEntityRendererFactory(defaultRenderer, spikeRenderer, flappyRenderer, bouncyRenderer, seekerRenderer, exitRenderer, playerRenderer, bulletRenderer, chomperRenderer);

    var level1 = "1";
    var level2 = "2";
    var level3 = "3";
    var level4 = "4";

    var gravity = 0.0014;
    var maxCollisionSteps = 6;

    var entitySpawner = hardCodedEntitySpawner(monsterDeathSound);

    var _concentricLevelStateFactory = concentricLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);
    var _skyscraperLevelStateFactory = skyscraperLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);
    var _spikeLevelStateFactory = spikeyLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);

    var levelStateFactories: { [_: string]: IStateFactory } = {};
    levelStateFactories[level1] = _concentricLevelStateFactory(level2, 0, 6, 20, 70, 300, 5);
    levelStateFactories[level2] = _skyscraperLevelStateFactory(level1, 1, 8, 20, 100, 6, 300);
    levelStateFactories[level3] = _spikeLevelStateFactory(level1, 1, 8, 300, 300, 10);

    var _delegatingLevelStateFactory = delegatingLevelStateFactory(
        levelStateFactories,
        level1,
        jumpSound,
        shootSound,
        playerDeathSound,
        winSound,
        wallJumpAvailableSound);

    var engine = new Engine(_delegatingLevelStateFactory);

    var locationToLevel = function () {
        var hash = window.location.hash;
        var param: any;
        if (hash) {
            // attempt to load a specific level
            hash = hash.substr(1);
            if (localStorage.getItem("s-"+hash)) {
                var parts = hash.split("-");
                var difficulty = parseInt(parts[0]);
                var levelName = parts[1];
                if (difficulty && levelName) {
                    var p: ILevelStateFactoryParam = {
                        player: null,
                        difficulty: difficulty,
                        levelName: levelName
                    }
                    param = p;
                    paramType = StateFactoryParamType.LevelLoad;
                }
            } else {
                param = null;
            }
        }
        return param;
    
    };

    var param = locationToLevel();
    var paramType: number;
    if (param == null) {
        paramType = StateFactoryParamType.LevelRestart;
    } else {
        var hash = window.location.hash;
        var newURL = window.location.href.substr(0, window.location.href.length - hash.length);
        // replace with menu/home screen (then we load a level, so it goes on top of this, so back always goes back!)
        window.history.replaceState(null, null, newURL);
    }

    engine.setStateFromParam(paramType, param);

    window.onpopstate = (event: PopStateEvent) => {
        var state = event.state;
        if (state == null) {
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

    /*
    var state = new Poust.Level.LevelState(canvas, player, 0.0014, context, defaultRenderer, 10);
    var i = 0;
    var max = 10;
    while (i < max) {
        var segments = i+1;
        while (segments > 0) {
            if (segments % 2 != 0) {
                var floor = new Poust.Level.AbstractEntity(Poust.Level.GroupId.Terrain);
                floor._bounds = new Poust.Level.PolarBounds((i + 1) * 100 + i * 10, segments * Math.PI * 2 / (i+1), 20, Math.PI * 2 / (i+1));
                floor._bounds.normalize();
                state.addEntity(floor);
            }
            segments --;
        }
        i++;
    }

    var spikeEntity = new Poust.Level.Entity.ObstacleEntity(Poust.Level.GroupId.Enemy, Poust.Level.Entity.ObstacleType.Spike);
    spikeEntity.setBounds(120, Math.PI, 16, 12);
    state.addEntity(spikeEntity);

    var flappyEntity = new Poust.Level.Entity.FlappyEntity(Poust.Level.GroupId.Enemy, 1, true, 0.08, 0.3, 460);
    flappyEntity.setBounds(480, Math.PI, 40, 40);
    state.addEntity(flappyEntity);

    var bouncyEntity = new Poust.Level.Entity.BouncyEntity(Poust.Level.GroupId.Enemy, 1, 0.05, true, true);
    bouncyEntity.setBounds(140, Math.PI / 2, 30, 30);
    state.addEntity(bouncyEntity);

    var seekerEntity = new Poust.Level.Entity.SeekerEntity(Poust.Level.GroupId.Enemy, 1, 400, 0.1, 1.1, 0.1, 0.2, 0.65);
    seekerEntity.setBounds(800, 0, 20, 20);
    state.addEntity(seekerEntity);

    state.addEntity(player);
    state.init();
    state.start();
    */


};