function flappyEntityRendererFactory(lineWidth: number, strokeStyle: any, fillStyle: any): IEntityRenderer {

    return function(context: CanvasRenderingContext2D, entity: IEntity): void {
        context.strokeStyle = strokeStyle;
        context.fillStyle = fillStyle;
        context.lineWidth = lineWidth;

        var bounds = entity.getBounds();

        var acr = bounds.getCenterAngleRadians();
        var sincr = Math.sin(acr);
        var coscr = Math.cos(acr);

        var age = entity.getStateAgeMillis();
        var scale: number;
        if (age < 200) {
            scale = age / 200;
        } else {
            scale = 1;
        }

        var asr = bounds.getStartAngleRadians();
        asr = acr + (asr - acr) * scale;
        var sinsr = Math.sin(asr);
        var cossr = Math.cos(asr);

        var aer = bounds.getEndAngleRadians();
        aer = acr + (aer - acr) * scale;
        var siner = Math.sin(aer);
        var coser = Math.cos(aer);

        var ir = bounds.getInnerRadiusPx();
        var or = bounds.getOuterRadiusPx();
        if (ir > 0) {
            context.beginPath();
            context.moveTo(cossr * or, sinsr * or);
            context.lineTo(cossr * ir, sinsr * ir);
            context.lineTo(coser * ir, siner * ir);
            context.lineTo(coser * or, siner * or);
            context.closePath();
            context.fill();
            context.stroke();
        }
    }
}

