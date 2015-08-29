module Poust.Level.Renderer {

    export function bouncyEntityRendererFactory(lineWidth: number, strokeStyle: any, fillStyle: any) {

        return function(context: CanvasRenderingContext2D, entity: IEntity): void {

            context.strokeStyle = strokeStyle;
            context.fillStyle = fillStyle;
            context.lineWidth = lineWidth;

            var bounds = entity.getBounds();

            var age = entity.getStateAgeMillis() % 3000;
            age -= 1500;
            age = Math.abs(age);
            var scalea = 1 + age / 3000;
            var scaler = 2 - age / 1500;

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
        }
    }

}