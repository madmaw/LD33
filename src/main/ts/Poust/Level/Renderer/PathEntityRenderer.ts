module Poust.Level.Renderer {

    export class PathEntityRenderer implements IEntityRenderer {

        public constructor(private _lineWidth: number, private _strokeStyle: any, private _fillStyle: any) {

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

            var ir = bounds.getInnerRadiusPx();
            var or = bounds.getOuterRadiusPx();

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