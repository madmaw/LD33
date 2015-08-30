function pathEntityRendererFactory(lineWidth: number, strokeStyle: any, fillStyle: any): IEntityRenderer {

    return function(context: CanvasRenderingContext2D, entity: IEntity): void {

        context.strokeStyle = strokeStyle;
        context.fillStyle = fillStyle;
        context.lineWidth = lineWidth;

        var bounds = entity.getBounds();

        var asr = bounds.getStartAngleRadians();
        var sinsr = Math.sin(asr);
        var cossr = Math.cos(asr);

        var aer = bounds.getEndAngleRadians();
        var siner = Math.sin(aer);
        var coser = Math.cos(aer);

        var ir = bounds.getInnerRadiusPx();
        var or = bounds.getOuterRadiusPx();
        if (ir > 0) {
            context.beginPath();
            context.moveTo(cossr * or, sinsr * or);
            context.arc(0, 0, or, asr, aer, false);
            context.lineTo(coser * ir, siner * ir);
            context.arc(0, 0, ir, aer, asr, true);
            context.closePath();
            context.fill();
            context.stroke();
        }
    }

}