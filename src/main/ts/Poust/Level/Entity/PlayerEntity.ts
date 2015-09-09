class PlayerEntity extends AbstractLivingPolarEntity {

    public static JUMP_INPUT_ID = -1;

    public static STATE_RUNNING = "r";
    public static STATE_JUMPING = "j";
    public static STATE_WALL_SLIDING = "ws";

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

    public constructor(
        groupId: number,
        mass: number,
        private _jumpPower: number,
        public _gun: IGun,
        deathSound: ISound,
        private _jumpSound: ISound,
        private _winSound: ISound,
        private _wallJumpAvailableSound: ISound
        ) {
        super(groupId, mass, true, deathSound);
        this._runningLeft = true;
        this._targets = {};
        this.continuousCollisions = true;
        this.setState(PlayerEntity.STATE_RUNNING);
        this._aimAge = 0;
    }

    public reset(r: number, a: number) {
        this.setBounds(r, a - this.bounds.widthRadians / 2);
        this._velocityAPX = 0;
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
        if (withEntity.groupId == GroupId.Enemy) {
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
                        var jy = screenHeight / 2 + Math.abs(target.sx - screenWidth / 2) * screenHeight / screenWidth;
                        if (!target.groundJumpDisallowed && this._onGround && (gestureHint == Gesture.Down || gestureHint == Gesture.Context && target.sy > jy)) {
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
                            target.groundJumpDisallowed = true;
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
        if (this._gun) {
            var crpx = this.bounds.getCenterRadiusPx();
            var recoil = this._gun.update(
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
                this._velocityAPX += recoil.a;
                // set the freshness to false
                for (var i in this._targets) {
                    var target = this._targets[i];
                    if (target.fresh) {
                        target.fresh = false;
                    }
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
            var v = this._velocityAPX;
            if (v > 0 && this._runningLeft || v < 0 && !this._runningLeft) {
                v = 0;
            }
            v = Math.abs(v);
            var acc = 1 / ((v * v * v * 7000 + 1) * 1000);
            //var acc = 1 / ((v * v * v * 700 + 1) * 700);
            this._velocityAPX += accMul * acc * timeMillis;
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
                    this._velocityAPX = -this._jumpPower;
                    jumpTarget.jumped = true;
                    this._jumpSound(intensity);
                } else if (this._onLeftWall) {
                    // wall jump
                    this._runningLeft = false;
                    this.velocityRPX = this._jumpPower;
                    this._velocityAPX = this._jumpPower;
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
                    this._velocityAPX += acc * timeMillis;
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
                            this.velocityRPX += 0.00045 * timeMillis;
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


}

