

window.onload = () => {

    var e = document.getElementById("canvas");

    var jumpSound = new Poust.AudioSound(["res/jump1.wav", "res/jump2.wav", "res/jump3.wav", "res/jump4.wav"]);
    var shootSound = new Poust.AudioSound(["res/shoot1.wav", "res/shoot2.wav", "res/shoot3.wav"]);
    var playerDeathSound = new Poust.AudioSound(["res/death1.wav"]);
    var monsterDeathSound = new Poust.AudioSound(["res/hurt1.wav"]);
    var winSound = new Poust.AudioSound(["res/win1.wav"]);

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
    var defaultRenderer = new Poust.Level.Renderer.PathEntityRenderer(2, "#FFFFFF", radialGradient);
    var flappyRenderer = new Poust.Level.Renderer.FlappyEntityRenderer(2, "#FFFFFF", radialGradient);
    var spikeRenderer = new Poust.Level.Renderer.SpikeEntityRenderer(2, "#FFFFFF", radialGradient);
    var bouncyRenderer = new Poust.Level.Renderer.BouncyEntityRenderer(2, "#FFFFFF", radialGradient);
    var seekerRenderer = new Poust.Level.Renderer.SeekerEntityRenderer(2, "#FFFFFF", radialGradient);
    var exitRenderer = new Poust.Level.Renderer.ExitEntityRenderer(2, "#FFFFFF", radialGradient);
    var playerRenderer = new Poust.Level.Renderer.PathEntityRenderer(2, "#FFFFFF", "rgba(255, 0, 0, 0.7)");
    var bulletRenderer = new Poust.Level.Renderer.SeekerEntityRenderer(2, "#FFFFAA", "rgba(255, 255, 0, 0.7");
    var entityRendererFactory = ((new Poust.Level.Factory.HardCodedEntityRendererFactory(defaultRenderer, spikeRenderer, flappyRenderer, bouncyRenderer, seekerRenderer, exitRenderer, playerRenderer, bulletRenderer)).createEntityRendererFactory());

    var level1 = "1";
    var level2 = "2";
    var level3 = "3";
    var level4 = "4";

    var gravity = 0.0014;
    var maxCollisionSteps = 6;

    var entitySpawner = new Poust.Level.Factory.HardCodedEntitySpawner().createSpawner(monsterDeathSound);

    var concentricLevelStateFactory = new Poust.Level.Factory.ConcentricLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);
    var skyscraperLevelStateFactory = new Poust.Level.Factory.SkyscraperLevelStateFactory(e, context, gravity, entityRendererFactory, maxCollisionSteps, entitySpawner);

    var levelStateFactories: { [_: string]: Poust.IStateFactory } = {};
    levelStateFactories[level1] = concentricLevelStateFactory.createStateFactory(level2, 1, 10, 20, 70, 300, 5);
    levelStateFactories[level2] = skyscraperLevelStateFactory.createStateFactory(level1, 1, 8, 20, 100, 10, 300);

    var delegatingLevelStateFactory = (new Poust.Level.Factory.DelegatingLevelStateFactory(
        levelStateFactories,
        level1,
        jumpSound,
        shootSound,
        playerDeathSound,
        winSound)).createStateFactory();

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