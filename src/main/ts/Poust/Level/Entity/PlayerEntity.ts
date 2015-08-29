module Poust.Level.Entity {

    export class PlayerEntity extends AbstractLivingPolarEntity {

        public static JUMP_INPUT_ID = -1;

        public static STATE_RUNNING = "running";
        public static STATE_JUMPING = "jumping";
        public static STATE_WALL_SLIDING = "wall_sliding";

        private _onGround: boolean;
        private _onRightWall: boolean;
        private _onLeftWall: boolean;
        private _wasOnWall: boolean;
        public _runningLeft: boolean;
        private _targets: { [_: number]: PlayerEntityTarget };
        private _nextLevelParams: any;

        public _aimAngle: number;
        
        // gun

        public constructor(
            groupId: GroupId,
            mass: number,
            private _jumpPower: number,
            private _gun: IGun,
            deathSound: ISound,
            private _jumpSound: ISound,
            private _winSound: ISound,
            private _wallJumpAvailableSound: ISound
            ) {
            super(groupId, mass, true, deathSound);
            this._runningLeft = true;
            this._targets = {};
            this._continuousCollisions = true;
            this.setState(PlayerEntity.STATE_RUNNING);
        }

        public reset(r: number, a: number) {
            this.setBounds(r, a);
            this._velocityAPX = 0;
            this._velocityRPX = 0;
        }

        public setTarget(inputId: number, sx: number, sy: number, gestureHint: Gesture) {
            var target = this._targets[inputId];
            if (target == null) {
                target = new PlayerEntityTarget(gestureHint, sx, sy);
                /*
                if (allowJump) {
                    if (this._onGround && (gestureHint == Gesture.Down || gestureHint == Gesture.Context && r < this._bounds.getInnerRadiusPx() )) {
                        target = new PlayerEntityTarget(true, r, a);
                    } else if (this._onLeftWall && (gestureHint == Gesture.Left || gestureHint == Gesture.Context && !PolarBounds.isClockwiseAfter(this._bounds.getStartAngleRadians(), a))) {
                        target = new PlayerEntityTarget(true, r, a);
                    } else if (this._onRightWall && (gestureHint == Gesture.Right || gestureHint == Gesture.Context && PolarBounds.isClockwiseAfter(this._bounds.getEndAngleRadians(), a))) {
                        target = new PlayerEntityTarget(true, r, a);
                    }
                }
                if (target == null) {
                    // shoot
                    target = new PlayerEntityTarget(false, r, a);
                }
                */
                this._targets[inputId] = target;
            } else {
                target.sx = sx;
                target.sy = sy;
                target.gestureHint = gestureHint;
            }
        }

        public copyTargets() {
            var result: { [_: number]: PlayerEntityTarget } = {};
            for (var id in this._targets) {
                result[id] = this._targets[id];
            }
            return result;
        }

        public clearTarget(inputId: number) {
            delete this._targets[inputId];
        }

        public setJump() {
            this._targets[PlayerEntity.JUMP_INPUT_ID] = new PlayerEntityTarget(Gesture.JumpOnly, null, null);
        }

        public clearJump() {
            delete this._targets[PlayerEntity.JUMP_INPUT_ID];
        }

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void {
            if (withEntity.getGroupId() == GroupId.Enemy) {
                if (withEntity instanceof LevelExitEntity) {
                    var levelExitEntity = <LevelExitEntity>withEntity;
                    this._nextLevelParams = levelExitEntity._nextLevelParamsFactory(this);
                } else {
                    this.setDying(withEntity);
                }
            } else {
                if (onEdge == PolarEdge.Bottom) {
                    this._onGround = true;
                } else if (onEdge == PolarEdge.Right) {
                    this._onRightWall = true;
                } else if (onEdge == PolarEdge.Left) {
                    this._onLeftWall = true;
                }
            }
        }

        public _createMotion(bounds: PolarBounds) {
            // only center when alive
            if (this.isDying()) {
                return super._createMotion(bounds);
            } else {
                return new Poust.Level.Motion.CameraCenterPolarMotion(bounds, this);
            }
        }


        updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
            super.updateAlive(level, timeMillis, createdEntities);

            var jumpTarget: PlayerEntityTarget = null;

            // are we jumping?
            var gunTargets: PolarPoint[] = [];
            for (var i in this._targets) {
                var target = this._targets[i];
                var jumping = false;
                if (target != null) {
                    var screenWidth = level.getScreenWidth();
                    var screenHeight = level.getScreenHeight();
                    // work out context
                    if (!target.jumped && !target.shooting) {
                        var gestureHint = target.gestureHint;
                        var scale = level.getScale(screenWidth, screenHeight);
                        if (gestureHint == Gesture.JumpOnly) {
                            jumping = true;
                        } else if (this._onGround && (gestureHint == Gesture.Down || gestureHint == Gesture.Context && target.sy > (screenHeight / 2 + this._bounds.getHeightPx() * scale))) {
                            jumping = true;
                        } else if (this._onLeftWall && (gestureHint == Gesture.Left || gestureHint == Gesture.Context && target.sx < screenWidth / 2)) {
                            jumping = true;
                        } else if (this._onRightWall && (gestureHint == Gesture.Right || gestureHint == Gesture.Context && target.sx >= screenWidth / 2)) {
                            jumping = true;
                        } else if (gestureHint == Gesture.AimOnly) {
                            
                            this._aimAngle = Math.atan2(target.sy - screenHeight / 2, target.sx - screenWidth / 2);
                        } else {
                            //TODO aim
                            target.shooting = true;
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
                    }
                }
            }


            // shoot!
            if (this._gun) {
                var crpx = this._bounds.getCenterRadiusPx();
                var recoil = this._gun.update(
                    timeMillis,
                    level,
                    this._onGround,
                    crpx,
                    this._bounds.getCenterAngleRadians(),
                    this.getVelocityRadiusPX(),
                    this.getVelocityAngleRadians(crpx),
                    gunTargets,
                    createdEntities
                );
                if (recoil) {
                    this._velocityRPX += recoil.r;
                    this._velocityAPX += recoil.a;
                }
            }

            

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
                var acc = 1 / ((Math.abs(this._velocityAPX * this._velocityAPX * this._velocityAPX * 7000) + 1) * 1000);
                this._velocityAPX += accMul * acc * timeMillis;
                if (jumpTarget) {
                    this._jumpSound();
                    this._velocityRPX = this._jumpPower;
                    jumpTarget.jumped = true;
                }

            } else {
                // are we jumping? add a little bit of upward momentum if we are moving up
                if (jumpTarget) {
                    if (this._onRightWall) {
                        // wall jump
                        this._runningLeft = true;
                        this._velocityRPX = this._jumpPower;
                        this._velocityAPX = -this._jumpPower;
                        jumpTarget.jumped = true;
                        this._jumpSound();
                    } else if (this._onLeftWall) {
                        // wall jump
                        this._runningLeft = false;
                        this._velocityRPX = this._jumpPower;
                        this._velocityAPX = this._jumpPower;
                        jumpTarget.jumped = true;
                        this._jumpSound();
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
                        if (this._velocityRPX < targetRPX) {
                            this._velocityRPX = Math.min(targetRPX, this._velocityRPX + 0.02);
                        }
                    }
                }
                if (this._velocityRPX > 0) {
                    for (var i in this._targets) {
                        var target = this._targets[i];
                        if (target != null) {
                            if (target.jumped) {
                                this._velocityRPX += 0.00045 * timeMillis;
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
                        this._wallJumpAvailableSound();
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

            if (this._nextLevelParams) {
                this._winSound();
                level.winLevel(this._nextLevelParams);
                this._nextLevelParams = null;
            }
        }


    }

}