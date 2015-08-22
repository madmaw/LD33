

window.onload = () => {

    var e = document.getElementById("canvas");
    var player = new Poust.Level.Entity.PlayerEntity(Poust.Level.GroupId.Player, 24, 1, 0.4);
    player._bounds = new Poust.Level.PolarBounds(510, Math.PI/2, 32, Math.PI / 30);


    var canvas = <HTMLCanvasElement>e;
    canvas.setAttribute("width", ""+document.body.clientWidth+"px");
    canvas.setAttribute("height", ""+document.body.clientHeight+"px");
    var context = canvas.getContext("2d");
    var radialGradient = context.createRadialGradient(0, 0, 0, 0, 0, 800);
    radialGradient.addColorStop(0, "rgba(255, 0, 255, 0.5)");
    radialGradient.addColorStop(0.1, "rgba(255, 0, 0, 0.5)");
    radialGradient.addColorStop(0.2, "rgba(255, 255, 0, 0.5)");
    radialGradient.addColorStop(0.3, "rgba(0, 255, 0, 0.5)");
    radialGradient.addColorStop(0.4, "rgba(0, 255, 255, 0.5)");
    radialGradient.addColorStop(0.5, "rgba(0, 0, 255, 0.6)");
    radialGradient.addColorStop(0.6, "rgba(255, 255, 255, 0.7)");
    radialGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    var defaultRenderer = new Poust.Level.Renderer.PathEntityRenderer(2, "#FFFFFF", radialGradient);
    var state = new Poust.Level.LevelState(canvas, player, 0.0014, context, defaultRenderer, 10);
    var i = 0;
    var max = 10;
    while (i < max) {
        var segments = i+1;
        while (segments > 0) {
            if (segments % 2 != 0) {
                var floor = new Poust.Level.AbstractEntity(Poust.Level.GroupId.Terrain);
                floor._bounds = new Poust.Level.PolarBounds((i + 1) * 100, segments * Math.PI * 2 / (i+1), 50, Math.PI * 2 / (i+1));
                floor._bounds.normalize();
                state.addEntity(floor);
            }
            segments --;
        }
        i++;
    }

    state.addEntity(player);

    state.init();
    state.start();
};