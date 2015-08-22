module Poust.Level.Entity {

    export class PlayerEntity extends AbstractPolarEntity {

        public static JUMP_INPUT_ID = -1;

        private _onGround: boolean;
        private _onRightWall: boolean;
        private _onLeftWall: boolean;
        private _runningRight: boolean;
        private _targets: { [_: number]: PlayerEntityTarget };
        
        // gun

        public constructor(groupId: GroupId, widthPx: number, mass: number, private _jumpPower: number) {
            super(groupId, widthPx, mass, true);
            this._runningRight = true;
            this._targets = {};
            this._continuousCollisions = true;
        }

        public setTarget(inputId: number, r: number, a: number, allowJump: boolean) {
            var target = this._targets[inputId];
            if (target == null) {
                if (allowJump) {
                    if (this._onGround) {
                        // TODO better check to see if we have clicked below
                        target = new PlayerEntityTarget(true, r, a);
                    } else if (this._onLeftWall) {
                        target = new PlayerEntityTarget(true, r, a);
                        // TODO better check to see if we have clicked on the left
                    } else if (this._onRightWall) {
                        target = new PlayerEntityTarget(true, r, a);
                        // TODO better check to see if we have clicked on the right
                    }
                }
                if (target == null) {
                    // shoot?
                }
                this._targets[inputId] = target;
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
            this._targets[PlayerEntity.JUMP_INPUT_ID] = new PlayerEntityTarget(true, null, null);
        }

        public clearJump() {
            delete this._targets[PlayerEntity.JUMP_INPUT_ID];
        }

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void {
            if (onEdge == PolarEdge.Bottom) {
                this._onGround = true;
            } else if (onEdge == PolarEdge.Right) {
                this._onRightWall = true;
            } else if (onEdge == PolarEdge.Left) {
                this._onLeftWall = true;
            }
        }

        update(level: LevelState, timeMillis: number): void {
            super.update(level, timeMillis);
            var jumpTarget: PlayerEntityTarget = null;
            // are we jumping?
            for (var i in this._targets) {
                var target = this._targets[i];
                if (target != null) {
                    if (target.jumping && !target.jumped) {
                        jumpTarget = target;
                        break;
                    }
                }
            }

            if (this._onGround) {
                if (this._onRightWall) {
                    this._runningRight = false;
                } else if (this._onLeftWall) {
                    this._runningRight = true;
                }
                var acc: number;
                if (this._runningRight) {
                    acc = 0.0001;
                } else {
                    acc = -0.0001;
                }
                this._velocityAPX += acc * timeMillis;
                if (jumpTarget) {
                    this._velocityRPX = this._jumpPower;
                    jumpTarget.jumped = true;
                }

            } else {
                // are we jumping? add a little bit of upward momentum if we are moving up
                if (jumpTarget) {
                    if (this._onRightWall) {
                        // wall jump
                        this._runningRight = false;
                        this._velocityRPX = this._jumpPower;
                        this._velocityAPX = -this._jumpPower;
                        jumpTarget.jumped = true;
                    } else if (this._onLeftWall) {
                        // wall jump
                        this._runningRight = true;
                        this._velocityRPX = this._jumpPower;
                        this._velocityAPX = this._jumpPower;
                        jumpTarget.jumped = true;
                    } 
                } else {
                    // add a little bit of forward momentum so we keep getting collision events for wall jump
                
                    if (this._onRightWall) {
                        acc = 0.001;
                    } else if (this._onLeftWall) {
                        acc = -0.001;
                    } else {
                        acc = 0;
                    }
                    this._velocityAPX += acc * timeMillis;
                }
                if (this._velocityRPX > 0) {
                    for (var i in this._targets) {
                        var target = this._targets[i];
                        if (target != null) {
                            if (target.jumping && target.jumped) {
                                this._velocityRPX += 0.0003 * timeMillis;
                                break;
                            }
                        }
                    }
                }
            }
            this._onGround = false;
            this._onRightWall = false;
            this._onLeftWall = false;
        }

    }

}