function livingEntityRendererContextSetup(context: CanvasRenderingContext2D, fillStyle: any, entity: IEntity) {

    var livingEntity = <AbstractLivingPolarEntity>entity;
    context.fillStyle = fillStyle;
    if (livingEntity.isDying && livingEntity.isDying()) {
        var age = livingEntity.getStateAgeMillis();
        var opacity = 1 - Math.min(1, age / 500);
        context.globalAlpha = opacity;
    }
}

function livingEntityRendererContextRestore(context: CanvasRenderingContext2D) {
    context.globalAlpha = 1;
}