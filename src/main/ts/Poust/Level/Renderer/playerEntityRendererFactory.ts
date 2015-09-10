function playerEntityRendererFactory(lineWidth: number, strokeStyle: any, bodyFillStyle: any, gunFillStyle): IEntityRenderer {

    return function (context: CanvasRenderingContext2D, entity: IEntity) {
        context.strokeStyle = strokeStyle;
        context.fillStyle = bodyFillStyle;
        //context.fillStyle = fillStyle;
        context.lineWidth = lineWidth;

        var bounds = entity.bounds;

        var ir = bounds.innerRadiusPx;
        if (ir > 0) {

            var playerEntity = <PlayerEntity>entity;

            var acr = bounds.getCenterAngleRadians();
            var sincr = Math.sin(acr);
            var coscr = Math.cos(acr);

            var bottomx = coscr * ir;
            var bottomy = sincr * ir;

            var width = bounds.getOuterCircumferencePx();
            var height = bounds.heightPx;

            var cycleMultiplier: number;
            var state = playerEntity.state;
            var stateAge = playerEntity.stateAgeMillis;
            if (state == PlayerEntity.STATE_RUNNING && Math.abs(playerEntity.velocityAPX) > 0.0001) {
                var cycleTime = 300 / Math.abs(playerEntity.velocityAPX);
                cycleMultiplier = ageToScale(entity, cycleTime);
            } else {
                cycleMultiplier = 0;
            }

            var legWidth = width * 0.2;
            var legHeight = width * 0.2;

            var armWidth = width * 0.2;
            var armLength = width * 0.3;

            if (state == PlayerEntity.STATE_DYING) {
                acr += ((stateAge * pi2) / 500)
            }

            context.save();
            context.translate(bottomx, bottomy);
            context.rotate(acr + pid2);
            if (playerEntity._runningLeft) {
                context.scale(-1, 1);
            }

            // draw the legs

            var leftLegCx = (width / 2 - legWidth) * cycleMultiplier + legWidth;
            var rightLegCx = width - leftLegCx - width / 2;
            leftLegCx -= width / 2;

            var legRotation: number;
            if (state == PlayerEntity.STATE_JUMPING) {
                legRotation = (pi / 6) * Math.min(1, stateAge / 200);
            } else {
                legRotation = 0;
            }

            context.save();
            context.translate(leftLegCx, -legHeight);
            context.rotate(legRotation);

            context.beginPath();
            context.moveTo(-legWidth / 2, -legHeight * 2);
            context.lineTo(-legWidth / 2, legHeight);
            context.lineTo(legWidth / 2, legHeight);
            context.lineTo(legWidth / 2, -legHeight);
            context.fill();
            context.stroke();

            context.restore();

            context.save();
            context.translate(rightLegCx, -legHeight);
            context.rotate(-legRotation);

            context.beginPath();
            context.moveTo(-legWidth / 2, -legHeight);
            context.lineTo(-legWidth / 2, legHeight);
            context.lineTo(legWidth / 2, legHeight);
            context.lineTo(legWidth / 2, -legHeight);
            context.fill();
            context.stroke();

            context.restore();

            // draw the body

            //context.rect(bottomx - width / 2, bottomy - height, width, height);
            context.beginPath();
            context.moveTo(-width / 2, -height);
            context.lineTo(-width / 2, -legHeight);
            context.lineTo(width / 2, -legHeight);
            context.lineTo(width / 2, -height);
            context.closePath();

            context.fill();
            context.stroke();


            // draw the eyes

            var eyeCy = -height * 0.7;
            var eyeRadius = width * 0.1;
            var eyeBasex = -width * 0.1 + eyeRadius * 2 * (1 + cycleMultiplier);

            var leftEyeCx = eyeBasex - eyeRadius * 1.5;
            var rightEyeCx = eyeBasex + eyeRadius * 1.5;

            //context.lineWidth = 1;
            context.fillStyle = strokeStyle;

            context.save();
            context.translate(leftEyeCx, eyeCy);
            context.scale(1, 1.4);

            context.beginPath();
            context.arc(0, 0, eyeRadius, 0, pi2);
            context.fill();

            context.restore();

            if (state == PlayerEntity.STATE_WALL_SLIDING) {

                context.moveTo(rightEyeCx - eyeRadius, eyeCy);
                context.lineTo(rightEyeCx + eyeRadius, eyeCy);
                context.stroke();

            } else {
                context.save();
                context.translate(rightEyeCx, eyeCy);
                context.scale(1, 1.2);

                context.beginPath();
                context.arc(0, 0, eyeRadius, 0, pi2);
                context.fill();

                context.restore();
            }

            // draw the arm and the gun

            var armShoulderCx = -width  * 0.25;
            var armShoulderCy = -height * 0.55;
            var armRotation = (1 - cycleMultiplier) * (playerEntity._runningLeft?-pi/3:pi/3);
            if (playerEntity._aimAngle != null && playerEntity._aimAge < 200) {
                armRotation = -playerEntity._aimAngle + pid2;
            }

            context.save();
            context.translate(armShoulderCx, armShoulderCy);
            if (playerEntity._runningLeft) {
                context.rotate(armRotation);
            } else {
                context.rotate(-(armRotation));
            }
            var shootingBackward = armRotation < pi && armRotation > 0;
            if (shootingBackward && playerEntity._runningLeft || !shootingBackward && !playerEntity._runningLeft) {
                context.scale(-1, 1);
            }
                

            var gun = <AbstractGun>playerEntity._gun;
            var gunScale: number;

            if (gun._chargeTime) {
                gunScale = 1 + Math.min(0.5, (gun._chargeTime / 999));
            } else {
                gunScale = 1;
            }

            var gunWidth = armWidth * 2 * gunScale;
            var gunHeight = armWidth * 3 * gunScale;
            var gunThickness = armWidth * 1.2 * gunScale;
            // draw the gun
            context.beginPath();
            context.moveTo(gunWidth / 2, armLength - armWidth / 2);
            context.lineTo(gunWidth / 2, armLength - armWidth / 2 + gunHeight);
            context.lineTo(gunWidth / 2 - gunThickness, armLength - armWidth / 2 + gunHeight);
            context.lineTo(gunWidth / 2 - gunThickness, armLength - armWidth / 2 + gunThickness);
            context.lineTo(-gunWidth / 2, armLength - armWidth / 2 + gunThickness);
            context.lineTo(-gunWidth / 2, armLength - armWidth / 2);
            context.closePath();
            if (gun.canShoot()) {
                context.fillStyle = gunFillStyle;
            } else {
                context.fillStyle = "#000";
            }
            context.fill();
            context.stroke();

            // draw the arm
            context.beginPath();
            context.moveTo(armWidth / 2, 0);
            context.lineTo(armWidth / 2, armLength - armWidth / 2);
            context.bezierCurveTo(armWidth / 2, armLength, -armWidth / 2, armLength, -armWidth / 2, armLength - armWidth / 2);
            context.lineTo(-armWidth / 2, 0);
            context.fillStyle = bodyFillStyle;
            context.fill();
            context.stroke();

            context.restore();


            context.restore();
        }
    }

}
