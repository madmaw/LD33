module Poust.Level.Renderer {


    export class SpikeEntityRenderer implements IEntityRenderer {

        constructor(private _lineWidth: number, private _strokeStyle: any, private _fillStyle: any) {

        }

        render(context: CanvasRenderingContext2D, entity: IEntity): void {
            context.strokeStyle = this._strokeStyle;
            context.fillStyle = this._fillStyle;
            context.lineWidth = this._lineWidth;

            var bounds = entity.getBounds();

            var asr = bounds.getStartAngleRadians();
            var sinsr = Math.sin(asr);
            var cossr = Math.cos(asr);

            var aer = bounds.getEndAngleRadians();
            var siner = Math.sin(aer);
            var coser = Math.cos(aer);

            var acr = bounds.getCenterAngleRadians();
            var sincr = Math.sin(acr);
            var coscr = Math.cos(acr);


            var ir = bounds.getInnerRadiusPx();
            var or = bounds.getOuterRadiusPx();
            if (ir > 0) {
                context.beginPath();
                context.moveTo(cossr * ir, sinsr * ir);
                context.lineTo(coscr * (or + bounds.getHeightPx()/2), sincr * or);
                context.lineTo(coser * ir, siner * ir);
                context.arc(0, 0, ir, aer, asr, true);
                context.closePath();
                context.fill();
                context.stroke();
            }
        }
    }

}