

window.onload = () => {

    var e = document.getElementById("canvas");

    var audioContext: AudioContext;
    if (window["AudioContext"]) {
        audioContext = new AudioContext();
    } else if (window["webkitAudioContext"]) {
        audioContext = new webkitAudioContext();
    }

    //var jumpSound = Poust.Sound.audioSoundFactory(["res/jump1.wav", "res/jump2.wav", "res/jump3.wav", "res/jump4.wav"]);
    var jumpSound = Poust.Sound.webAudioToneSoundFactory(audioContext, 'sawtooth', 250, 1000, 200, 0.01, 0.08, 0.12, 0.3);
    //var shootSound1 = new Poust.Sound.AudioSound(["res/shoot1.wav", "res/shoot2.wav", "res/shoot3.wav"]);
    var shootSound1 = Poust.Sound.webAudioToneSoundFactory(audioContext, 'square', 600, 100, 100, 0, 0.035, 0.04, 0.2, 0.6);
    var shootSound = Poust.Sound.webAudioGunSoundFactory(audioContext, shootSound1);
    
    var playerDeathSound = Poust.Sound.webAudioVibratoSoundFactory(audioContext, 200, 10, 6, 0.7);
    //var wallJumpAvailableSound = Poust.Sound.webAudioToneSoundFactory(audioContext, 100, 40, 10, 0, 0.1, 0.14, 0.3);
    var wallJumpAvailableSound = Poust.Sound.webAudioToneSoundFactory(audioContext, 'square', 250, -150, 100, 0, 0.05, 0.1, 0.2, 0.5);
    

    //var monsterDeathSound = Poust.Sound.audioSoundFactory(["res/hurt1.wav"]);
    var monsterDeathSound = Poust.Sound.webAudioToneSoundFactory(audioContext, 'sawtooth', 150, -100, 100, 0.01, 0.05, 0.1, 0.3);
    //var winSound = Poust.Sound.audioSoundFactory(["res/win1.wav"]);
    var winSound = Poust.Sound.webAudioVibratoSoundFactory(audioContext, 600, 1000, 14, 0.8);

    var canvas = <HTMLCanvasElement>e;
    canvas.setAttribute("width", ""+document.body.clientWidth+"px");
    canvas.setAttribute("height", ""+document.body.clientHeight+"px");
    var context = canvas.getContext("2d");
    var radialGradient = context.createRadialGradient(0, 0, 0, 0, 0, 1500);
    radialGradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
    radialGradient.addColorStop(0.2, "rgba(255, 0, 255, 0.5)");
    radialGradient.addColorStop(0.32, "rgba(255, 0, 0, 0.5)");
    radialGradient.addColorStop(0.44, "rgba(255, 255, 0, 0.5)");
    radialGradient.addColorStop(0.56, "rgba(0, 255, 0, 0.5)");
    radialGradient.addColorStop(0.68, "rgba(0, 255, 255, 0.5)");
    radialGradient.addColorStop(0.8, "rgba(0, 0, 255, 0.6)");
    radialGradient.addColorStop(0.92, "rgba(255, 255, 255, 0.7)");
    radialGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    

    var defaultRenderer = Poust.Level.Renderer.pathEntityRendererFactory(2, "#FFFFFF", radialGradient);
    var flappyRenderer = Poust.Level.Renderer.flappyEntityRendererFactory(2, "#FFFFFF", radialGradient);
    var spikeRenderer = Poust.Level.Renderer.spikeEntityRendererFactory(2, "#FFFFFF", radialGradient);
    var bouncyRenderer = Poust.Level.Renderer.bouncyEntityRendererFactory(2, "#FFFFFF", radialGradient);
    var seekerRenderer = Poust.Level.Renderer.seekerEntityRendererFactory(2, "#FFFFFF", radialGradient);
    var exitRenderer = Poust.Level.Renderer.exitEntityRendererFactory(2, "#FFFFFF", radialGradient);
    var playerRenderer = Poust.Level.Renderer.playerEntityRendererFactory(2, "#FFFFFF", "rgba(255, 0, 0, 1)", "rgba(128, 128, 0, 1)");
    var bulletRenderer = Poust.Level.Renderer.seekerEntityRendererFactory(2, "#FFFFAA", "rgba(255, 255, 0, 0.7)");
    var entityRendererFactory = Poust.Level.Factory.hardCodedEntityRendererFactory(defaultRenderer, spikeRenderer, flappyRenderer, bouncyRenderer, seekerRenderer, exitRenderer, playerRenderer, bulletRenderer);

    var level1 = "1";
    var level2 = "2";
    var level3 = "3";
    var level4 = "4";

    var gravity = 0.0014;
    var maxCollisionSteps = 6;

    var entitySpawner = new Poust.Level.Factory.HardCodedEntitySpawner().createSpawner(monsterDeathSound);

    var concentricLevelStateFactory = new Poust.Level.Factory.ConcentricLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);
    var skyscraperLevelStateFactory = new Poust.Level.Factory.SkyscraperLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);
    var spikeLevelStateFactory = new Poust.Level.Factory.SpikeyLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);

    var levelStateFactories: { [_: string]: Poust.IStateFactory } = {};
    levelStateFactories[level1] = concentricLevelStateFactory.createStateFactory(level2, 1, 6, 20, 70, 300, 5);
    levelStateFactories[level2] = skyscraperLevelStateFactory.createStateFactory(level1, 1, 8, 20, 100, 6, 300);
    levelStateFactories[level3] = spikeLevelStateFactory.createStateFactory(level1, 1, 8, 300, 300, 10);

    var delegatingLevelStateFactory = (new Poust.Level.Factory.DelegatingLevelStateFactory(
        levelStateFactories,
        level1,
        jumpSound,
        shootSound,
        playerDeathSound,
        winSound,
        wallJumpAvailableSound)).createStateFactory();

    var engine = new Poust.Engine(delegatingLevelStateFactory);
    engine.setStateFromParam(new Poust.Level.LevelStateRestartParam());

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