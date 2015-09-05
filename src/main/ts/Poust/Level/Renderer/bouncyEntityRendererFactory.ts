function bouncyEntityRendererFactory(lineWidth: number, strokeStyle: any, fillStyle: any) {

    return function(context: CanvasRenderingContext2D, entity: IEntity): void {

        context.strokeStyle = strokeStyle;
        context.lineWidth = lineWidth;
        livingEntityRendererContextSetup(context, fillStyle, entity);

        var bounds = entity.getBounds();

        var scale = ageToScale(entity, 3000);
        var scalea = 1 + scale/2;
        var scaler = 2 - scale;

        var acr = bounds.getCenterAngleRadians();

        var asr = bounds.getStartAngleRadians();
        asr = acr + (asr - acr) * scalea;
        var sinsr = Math.sin(asr);
        var cossr = Math.cos(asr);

        var aer = bounds.getEndAngleRadians();
        aer = acr + (aer - acr) * scalea;
        var siner = Math.sin(aer);
        var coser = Math.cos(aer);

        //acr = (aer + asr) / 2;
        var sincr = Math.sin(acr);
        var coscr = Math.cos(acr);

        var cr = bounds.getCenterRadiusPx();
        var ir = bounds.getInnerRadiusPx();
        ir = cr + (ir - cr) * scaler;
        var or = bounds.getOuterRadiusPx();
        or = cr + (or - cr) * scaler;
        if (ir > 0) {
            context.beginPath();
            context.moveTo(cossr * cr, sinsr * cr);
            context.lineTo(coscr * ir, sincr * ir);
            context.lineTo(coser * cr, siner * cr);
            context.lineTo(coscr * or, sincr * or);
            context.closePath();
            context.fill();
            context.stroke();
        }
        livingEntityRendererContextRestore(context);
    }
}