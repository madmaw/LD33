function terrainEntityRendererFactory(lineWidth: number, strokeStyle: any, fillStyle: any): IEntityRenderer {

    return function(context: CanvasRenderingContext2D, entity: IEntity): void {

        var abstractEntity = <AbstractEntity>entity;

        context.strokeStyle = strokeStyle;
        context.fillStyle = fillStyle;
        context.lineWidth = lineWidth;

        var bounds = entity.bounds;


        var dx = 0;
        var dy = 0;
        /*
        if (abstractEntity.gravityMultiplier && abstractEntity.respectsGravityTimeout > 0 && abstractEntity.respectsGravityTimeout < 2000) {
            var dt = 2000 - abstractEntity.respectsGravityTimeout;
            dt /= 100;
            dx = Math.random() * dt - dt/2;
            dy = Math.random() * dt - dt/2;
        }
        */

        var asr = bounds.startAngleRadians;
        var sinsr = Math.sin(asr);
        var cossr = Math.cos(asr);

        var aer = bounds.getEndAngleRadians();
        var siner = Math.sin(aer);
        var coser = Math.cos(aer);

        var ir = bounds.innerRadiusPx;
        var or = bounds.getOuterRadiusPx();
        if (or > 0) {
            context.beginPath();
            context.moveTo(dx + cossr * or, dy + sinsr * or);
            context.arc(dx, dy, or, asr, aer, false);
            if (ir > 0) {
                context.lineTo(dx + coser * ir, dy + siner * ir);
                context.arc(dx, dy, ir, aer, asr, true);
            }
            context.closePath();
            if (abstractEntity.respectsGravityTimeout && abstractEntity.respectsGravityTimeout > 0) {
                if (abstractEntity.gravityMultiplier && abstractEntity.respectsGravityTimeout < 5000) {
                    context.globalAlpha = abstractEntity.respectsGravityTimeout / 5000;
                    context.fill();
                    context.globalAlpha = 1;
                } else {
                    context.fill();
                }
            }
            context.stroke();
        }
    }

}