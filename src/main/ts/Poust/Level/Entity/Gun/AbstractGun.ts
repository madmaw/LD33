class AbstractGun implements IGun {

    private _shootCoolDown: number;
    public _chargeTime: number;
        

    public constructor(
        private _millisBetweenShots: number,
        private _recoil: number,
        private _shootSound: ISound
    ) {
        this._shootCoolDown = 0;
        this._chargeTime = 0;
    }

    update(
        diffMillis: number,
        state: LevelState,
        onGround: boolean,
        charging: boolean,
        r: number,
        a: number,
        vr: number,
        va: number,
        targets: IPolarPoint[],
        createdEntities: IEntity[]
        ): IPolarPoint {
        if (charging) {
            this._chargeTime += diffMillis;
        } else {
            this._chargeTime = 0;
        }

        this._shootCoolDown -= diffMillis;
        var recoil: IPolarPoint = null;
        // charge up 
        if (this._shootCoolDown <= 0) {


            if (targets.length > 0) {
                var sinVa = Math.sin(va);
                var cosVa = Math.cos(va);

                var baseVx = va * r;
                var baseVy = 0;

                

                var baseR = rotate(baseVy, baseVx, a);

                var targetIndex = 0;
                var sourcePosition = getCartesianPoint(r, a);
                var recoilDX = 0;
                var recoilDY = 0;


                while (targetIndex < targets.length) {
                    var target = targets[targetIndex];
                    var targetPosition = getCartesianPoint(target.r, target.a);

                    var tdx = targetPosition.x - sourcePosition.x;
                    var tdy = targetPosition.y - sourcePosition.y;
                    var th = Math.sqrt(tdx * tdx + tdy * tdy);

                    var ta = Math.atan2(tdy, tdx);
                    var da = pi / 11;
                    var bullets;
                    if (charging) {
                        bullets = 1;
                    } else {
                        bullets = 4;
                    }
                    var sa = ta - ((bullets - 1) * da)/2;

                    for (var i = 0; i < bullets; i++) {
                        var ba = sa + da * i;
                        var cos = Math.cos(ba);
                        var sin = Math.sin(ba);
                        var btx = sourcePosition.x + cos * th;
                        var bty = sourcePosition.y + sin * th;
                        // don't show ammo, so never deplete it
                        //this._ammo--;
                        var bullet = this.createBullet(
                            sourcePosition.x,
                            sourcePosition.y,
                            btx,
                            bty,
                            baseR.x,
                            baseR.y,
                            !charging
                            );
                        if (bullet) {
                            //state.addEntity(bullet);
                            createdEntities.push(bullet);
                        }
                        var dx = targetPosition.x - sourcePosition.x;
                        var dy = targetPosition.y - sourcePosition.y;
                        if (!charging) {
                            recoilDX += cos;
                            recoilDY += sin;
                            this._shootCoolDown += this._millisBetweenShots;
                        }
                    }

                    targetIndex++;
                    // only shoot in one direction
                    break;

                }
                recoilDX /= targetIndex;
                recoilDY /= targetIndex;
                // convert to polar coordinates (given that we are talking about a single pixel, the skewing shouldn't be too bad)
                var recoilCartesian = rotate(recoilDX * -this._recoil, recoilDY * -this._recoil, -a);
                // note it's an apx, not a
                // note, these values have been rotated to zero, so x=r y=apx
                recoil = { r: recoilCartesian.x, a: recoilCartesian.y };
                this._shootSound(charging?0.4:1);
            }
        }
        if (this._shootCoolDown < 0) {
            this._shootCoolDown = 0;
        }
        return recoil;
    }

    public canShoot(): boolean {
        return this._shootCoolDown <= 0;
    }

    

    public createBullet(
        fromx: number,
        fromy: number,
        tox: number,
        toy: number, 
        baseVx: number, 
        baseVy: number, 
        backfire: boolean
        ): IEntity {
        var lifespanMillis: number;
        if (backfire) {
            lifespanMillis = 180;
        } else {
            lifespanMillis = 1000;
        }
        var result = new BulletEntity(GroupId.Player, 10, 10, 1, lifespanMillis);
        result.setCenter(fromx, fromy);
        var dx = tox - fromx;
        var dy = toy - fromy;
        var h = Math.sqrt(dx * dx + dy * dy);
        var v = 0.7 + Math.random() * 0.4;
        dx = (dx * v) / h;
        dy = (dy * v) / h;

        // add the shooter velocity (going to stuff up aiming?!)


        result._velocityDx = baseVx + dx;
        result._velocityDy = baseVy + dy;
        return result;
    }

}