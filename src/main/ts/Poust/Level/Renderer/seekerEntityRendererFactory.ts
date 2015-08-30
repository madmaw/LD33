function seekerEntityRendererFactory(lineWidth: number, strokeStyle: any, fillStyle: any): IEntityRenderer {

    return function(context: CanvasRenderingContext2D, entity: IEntity): void {

        context.strokeStyle = strokeStyle;
        context.fillStyle = fillStyle;
        context.lineWidth = lineWidth;

        var bounds = entity.getBounds();

        var age = entity.getStateAgeMillis() % 3000;


        var acr = bounds.getCenterAngleRadians();

        var asr = bounds.getStartAngleRadians();
        var sinsr = Math.sin(asr);
        var cossr = Math.cos(asr);

        var aer = bounds.getEndAngleRadians();
        var siner = Math.sin(aer);
        var coser = Math.cos(aer);

        //acr = (aer + asr) / 2;
        var sincr = Math.sin(acr);
        var coscr = Math.cos(acr);

        var cr = bounds.getCenterRadiusPx();
        var ir = bounds.getInnerRadiusPx();
        var or = bounds.getOuterRadiusPx();
        if (ir > 0) {
            var r = Math.max(Math.abs(cossr * cr - coscr * cr), Math.abs(or - cr));
            context.beginPath();
            //context.moveTo(cossr * cr, sincr * cr);
            context.arc(coscr * cr, sincr * cr, r, 0, Math.PI * 2);
            context.closePath();
            context.fill();
            context.stroke();
        }            
    }
}

