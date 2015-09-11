class PlayerEntity extends AbstractLivingPolarEntity {

    public static JUMP_INPUT_ID = -1;

    public static STATE_RUNNING = "r";
    public static STATE_JUMPING = "j";
    public static STATE_WALL_SLIDING = "s";

    private _onGround: boolean;
    private _onRightWall: boolean;
    private _onLeftWall: boolean;
    private _wasOnWall: boolean;
    public _runningLeft: boolean;
    private _targets: { [_: number]: IPlayerEntityTarget };
    private _nextLevelParams: any;

    public _aimAngle: number;
    public _aimAge: number;
        
    // gun
    private _shootCoolDown: number;
    public _chargeTime: number;

    public constructor(
        groupId: number,
        private _jumpPower: number,
        deathSound: ISound,
        private _jumpSound: ISound,
        private _winSound: ISound,
        private _wallJumpAvailableSound: ISound,
        // gun
        private _millisBetweenShots: number,
        private _recoil: number,
        private _shootSound: ISound

        ) {
        super(groupId, ENTITY_TYPE_ID_PLAYER, deathSound);
        this.mass = 4;
        this.gravityMultiplier = 1;
        this._runningLeft = true;
        this._targets = {};
        this.continuousCollisions = true;
        this.setState(PlayerEntity.STATE_RUNNING);
        this._aimAge = 0;
        // gun
        this._shootCoolDown = 0;
        this._chargeTime = 0;

    }

    public reset(r: number, a: number) {
        this.setBounds(r, a - this.bounds.widthRadians / 2);
        this.velocityAPX = 0;
        this.velocityRPX = 0;
    }

    public setTarget(inputId: number, sx: number, sy: number, gestureHint: number) {
        var target = this._targets[inputId];
        if (!target) {
            target = { gestureHint: gestureHint, sx: sx, sy: sy, fresh: true };

            this._targets[inputId] = target;
        } else {
            target.sx = sx;
            target.sy = sy;
            target.gestureHint = gestureHint;
        }
    }

    public copyTargets() {
        var result: { [_: number]: IPlayerEntityTarget } = {};
        for (var id in this._targets) {
            result[id] = this._targets[id];
        }
        return result;
    }

    public clearTarget(inputId: number) {
        //delete this._targets[inputId];
        var target = this._targets[inputId];
        if (target) {
            target.cleared = true;
        }
    }

    public setJump() {
        this._targets[PlayerEntity.JUMP_INPUT_ID] = { gestureHint: Gesture.JumpOnly, fresh: true };
    }

    public clearJump() {
        delete this._targets[PlayerEntity.JUMP_INPUT_ID];
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        if (withEntity.groupId == GROUP_ID_ENEMY) {
            var levelExitEntity = <ILevelExitEntity>withEntity;

            if (levelExitEntity.nextLevelParamsFactory) {
                this._nextLevelParams = levelExitEntity.nextLevelParamsFactory(this);
                levelExitEntity.dead = true;
            } else {
                this.takeDamage();
            }
        } else {
            if (onEdge == POLAR_EDGE_BOTTOM) {
                this._onGround = true;
            } else if (onEdge == POLAR_EDGE_RIGHT) {
                this._onRightWall = true;
            } else if (onEdge == POLAR_EDGE_LEFT) {
                this._onLeftWall = true;
            }
        }
    }

    updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        super.updateAlive(level, timeMillis, createdEntities);

        var jumpTarget: IPlayerEntityTarget = null;
        var charge = false;

        // are we jumping?
        var gunTargets: IPolarPoint[] = [];
        for (var i in this._targets) {
            var target = this._targets[i];
            var jumping = false;
            if (target) {
                var screenWidth = level.getScreenWidth();
                var screenHeight = level.getScreenHeight();
                // work out context
                if (!target.jumped && !target.shooting) {
                    var gestureHint = target.gestureHint;
                    var scale = level.getScale(screenWidth, screenHeight);
                    if (gestureHint == Gesture.JumpOnly) {
                        jumping = true;
                    } else {
                        // are we jumping?

                        //var miny = (screenHeight / 2 + this._bounds.getHeightPx() * scale);
                        //var p = level.getPolarPoint(target.sx, target.sy);
                        var jy = screenHeight / 2 + Math.abs(target.sx - screenWidth / 2) * screenHeight * 0.75 / screenWidth;
                        if (this._onGround && (gestureHint == Gesture.Down || gestureHint == Gesture.Context && target.sy > jy)) {
                            jumping = true;
                        } else if (this._onLeftWall && (gestureHint == Gesture.Left || gestureHint == Gesture.Context && target.sx < screenWidth / 2)) {
                            jumping = true;
                        } else if (this._onRightWall && (gestureHint == Gesture.Right || gestureHint == Gesture.Context && target.sx >= screenWidth / 2)) {
                            jumping = true;
                        } else {
                            this._aimAngle = Math.atan2(target.sy - screenHeight / 2, target.sx - screenWidth / 2);
                            this._aimAge = 0;
                            if (gestureHint != Gesture.AimOnly) {
                                charge = charge || (gestureHint != Gesture.AimOnly && !target.cleared);
                                if ((gestureHint == Gesture.ShootOnly || gestureHint == Gesture.Context && !target.jumped) && target.cleared || target.fresh) {
                                    target.shooting = true;
                                }
                            }
                        }
                    }
                }

                if (jumping) {
                    if (!target.jumped) {
                        jumpTarget = target;
                    }
                } else if (target.shooting) {
                    // it's shooting
                    var polarPoint = level.getPolarPoint(target.sx, target.sy);
                    gunTargets.push(polarPoint);
                    this._aimAngle = Math.atan2(target.sy - screenHeight / 2, target.sx - screenWidth / 2);
                    this._aimAge = 0;
                    target.shooting = false;
                }
                if (target.cleared) {
                    delete this._targets[i];
                } 
            }
        }


        // shoot!
        var crpx = this.bounds.getCenterRadiusPx();
        var recoil = this.updateGun(
            timeMillis,
            level,
            this._onGround,
            charge, 
            crpx,
            this.bounds.getCenterAngleRadians(),
            this.getVelocityRadiusPX(),
            this.getVelocityAngleRadians(crpx),
            gunTargets,
            createdEntities
        );
        if (recoil) {
            this.velocityRPX += recoil.r;
            this.velocityAPX += recoil.a;
            // set the freshness to false
            for (var i in this._targets) {
                var target = this._targets[i];
                if (target.fresh) {
                    target.fresh = false;
                }
            }
        }

            

        var intensity = Math.min(this.bounds.innerRadiusPx / 1500, 1);
        if (this._onGround) {
            this.setState(PlayerEntity.STATE_RUNNING);
            if (this._onRightWall) {
                this._runningLeft = true;
            } else if (this._onLeftWall) {
                this._runningLeft = false;
            }
            var accMul: number;
            if (this._runningLeft) {
                accMul = -1;
            } else {
                accMul = 1;
            }
            var v = this.velocityAPX;
            if (v > 0 && this._runningLeft || v < 0 && !this._runningLeft) {
                v = 0;
            }
            v = Math.abs(v);
            var acc = 1 / ((v * v * v * 7000 + 1) * 1000);
            //var acc = 1 / ((v * v * v * 700 + 1) * 700);
            this.velocityAPX += accMul * acc * timeMillis;
            if (jumpTarget) {
                this._jumpSound(intensity);
                this.velocityRPX = this._jumpPower;
                jumpTarget.jumped = true;
            }

        } else {
            // are we jumping? add a little bit of upward momentum if we are moving up
            if (jumpTarget) {
                if (this._onRightWall) {
                    // wall jump
                    this._runningLeft = true;
                    this.velocityRPX = this._jumpPower;
                    this.velocityAPX = -this._jumpPower;
                    jumpTarget.jumped = true;
                    this._jumpSound(intensity);
                } else if (this._onLeftWall) {
                    // wall jump
                    this._runningLeft = false;
                    this.velocityRPX = this._jumpPower;
                    this.velocityAPX = this._jumpPower;
                    jumpTarget.jumped = true;
                    this._jumpSound(intensity);
                }
            } else {
                // add a little bit of forward momentum so we keep getting collision events for wall jump
                if (this._onLeftWall || this._onRightWall) {
                    if (this._onRightWall) {
                        acc = 0.001;
                    } else {
                        acc = -0.001;
                    } 
                    this.velocityAPX += acc * timeMillis;
                    var targetRPX = -0.15;
                    if (this.velocityRPX < targetRPX) {
                        this.velocityRPX = Math.min(targetRPX, this.velocityRPX + 0.02);
                    }
                }
            }
            if (this.velocityRPX > 0) {
                for (var i in this._targets) {
                    var target = this._targets[i];
                    if (target) {
                        if (target.jumped) {
                            this.velocityRPX += 0.0005 * timeMillis;
                            break;
                        }
                    }
                }
            }
        }
        if (this._onRightWall || this._onLeftWall) {
            this.setState(PlayerEntity.STATE_WALL_SLIDING);
            if (!this._wasOnWall) {
                if (!this._onGround) {
                    this._wallJumpAvailableSound(intensity);
                }
                this._wasOnWall = true;
            }
        } else {
            if (!this._onGround) {
                this.setState(PlayerEntity.STATE_JUMPING);
            }
            this._wasOnWall = false;
        }
        this._onGround = false;
        this._onRightWall = false;
        this._onLeftWall = false;
        this._aimAge += timeMillis;

        if (this._nextLevelParams) {
            this._winSound(intensity);
            level.winLevel(this._nextLevelParams);
            this._nextLevelParams = null;
        }
    }

    // gun

    updateGun(
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
                    var sa = ta - ((bullets - 1) * da) / 2;

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
                this._shootSound(charging ? 0.4 : 1);
            }
        }
        if (this._shootCoolDown < 0) {
            this._shootCoolDown = 0;
        }
        if (charging) {
            this._chargeTime += diffMillis;
        } else {
            this._chargeTime = 0;
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
            lifespanMillis = this._chargeTime;
        } else {
            lifespanMillis = 1000;
        }
        var result = new AbstractCartesianEntity(GROUP_ID_PLAYER, 10, 10, 1, lifespanMillis);
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

