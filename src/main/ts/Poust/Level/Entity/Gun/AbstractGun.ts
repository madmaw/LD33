module Poust.Level.Entity.Gun {

    export class AbstractGun implements IGun {

        private _shootCoolDown: number;
        private _reloadCoolDown: number;
        private _ammo: number;

        public constructor(
            private _millisBetweenShots: number,
            private _millisBetweenReloads: number,
            private _clipSize: number,
            private _recoil: number,
            private _numGuns: number
        ) {
            this._shootCoolDown = 0;
            this._reloadCoolDown = 0;
            this._ammo = this._clipSize;
        }

        update(diffMillis: number, state: LevelState, onGround: boolean, r: number, a: number, targets: PolarPoint[]): PolarPoint {
            this._shootCoolDown -= diffMillis;
            if (onGround) {
                this._reloadCoolDown -= diffMillis;
                if (this._ammo < this._clipSize && this._reloadCoolDown <= 0) {
                    // play a noise
                    this._ammo = this._clipSize;
                    this._reloadCoolDown += this._millisBetweenReloads;
                }
            }
            var recoil: PolarPoint = null;
            if (this._shootCoolDown <= 0 && targets.length > 0 && this._ammo > 0) {
                var targetIndex = 0;
                var sourcePosition = PolarPoint.getCartesianPoint(r, a);
                var recoilDX = 0;
                var recoilDY = 0;
                while (this._ammo > 0 && targetIndex < targets.length) {
                    var target = targets[targetIndex];
                    var targetPosition = PolarPoint.getCartesianPoint(target.r, target.a);
                    this._ammo--;
                    var bullet = this.createBullet(sourcePosition.x, sourcePosition.y, targetPosition.x, targetPosition.y);
                    if (bullet != null) {
                        state.addEntity(bullet);
                    }
                    var dx = targetPosition.x - sourcePosition.x;
                    var dy = targetPosition.y - sourcePosition.y;
                    var h = Math.sqrt(dx * dx + dy * dy);
                    recoilDX += dx / h;
                    recoilDY += dy / h;
                    targetIndex++;
                }
                recoilDX /= targetIndex;
                recoilDY /= targetIndex;
                // convert to polar coordinates (given that we are talking about a single pixel, the skewing shouldn't be too bad)
                var recoilCartesian = PolarPoint.rotate(recoilDX * -this._recoil, recoilDY * -this._recoil, -a);
                // note it's an apx, not a
                // note, these values have been rotated to zero, so x=r y=apx
                recoil = new PolarPoint(recoilCartesian.x, recoilCartesian.y);

                this._shootCoolDown += this._millisBetweenShots;
            }
            if (this._reloadCoolDown < 0) {
                this._reloadCoolDown = 0;
            }
            if (this._shootCoolDown < 0) {
                this._shootCoolDown = 0;
            }
            return recoil;
        }

        public createBullet(fromx: number, fromy: number, tox: number, toy: number): IEntity {
            var result = new BulletEntity(GroupId.Player, 10, 10, 10, 1000);
            result.setCenter(fromx, fromy);
            var dx = tox - fromx;
            var dy = toy - fromy;
            var h = Math.sqrt(dx * dx + dy * dy);
            var v = 2;
            dx = (dx * v) / h;
            dy = (dy * v) / h;

            // add the shooter velocity (going to stuff up aiming?!)


            result._velocityDx = dx;
            result._velocityDy = dy;
            return result;
        }

    }

}