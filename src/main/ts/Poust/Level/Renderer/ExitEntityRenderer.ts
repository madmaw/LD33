module Poust.Level.Renderer {

    export class ExitEntityRenderer implements IEntityRenderer {

        public constructor(private _lineWidth: number, private _strokeStyle: any, private _fillStyle: any) {

        }

        render(context: CanvasRenderingContext2D, entity: IEntity): void {

            context.strokeStyle = this._strokeStyle;
            context.fillStyle = this._fillStyle;
            context.lineWidth = this._lineWidth;

            var bounds = entity.getBounds();

            var cycle = 500;
            var age = entity.getStateAgeMillis();
            var draws = 3;
            var scaleOffset = (age % cycle) / (draws * cycle);
            var scaleDelta = 1 / draws;

            var draw = 0;
            while (draw < draws) {
                var scale = scaleOffset + scaleDelta * draw;
                draw++;

                context.globalAlpha = Math.max(0, 1 - scale * scale);

                var w = bounds.getWidthRadians();
                var acr = bounds.getCenterAngleRadians();
                var asr = acr - w * scale;
                var aer = acr + w * scale;

                var sinsr = Math.sin(asr);
                var cossr = Math.cos(asr);

                var siner = Math.sin(aer);
                var coser = Math.cos(aer);

                var cr = bounds.getCenterRadiusPx();
                var h = bounds.getHeightPx();
                var ir = cr - h * scale;
                var or = cr + h * scale;
                if (ir > 0) {
                    context.beginPath();
                    context.moveTo(cossr * or, sinsr * or);
                    context.arc(0, 0, or, asr, aer, false);
                    context.lineTo(coser * ir, siner * ir);
                    context.arc(0, 0, ir, aer, asr, true);
                    context.closePath();
                    //context.fill();
                    context.stroke();
                }
            }
            context.globalAlpha = 1;
        }




    }


}