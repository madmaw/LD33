module Poust.Level.Entity {

    export class SeekerEntity extends AbstractLivingPolarEntity {

        private _bounceA: number;
        private _prevVelocityAPX: number;
        private _targetX: number;
        private _targetY: number;
        private _onGround: boolean;

        public constructor(
            groupId: GroupId,
            mass: number,
            deathSound: ISound,
            private _searchRadius: number,
            private _acceleration: number,
            private _bounce: number,
            private _maxVelocityAPx: number,
            private _smallJumpVelocity: number,
            private _bigJumpVelocity: number) {
            super(groupId, mass, true, deathSound);
        }

        updateAlive(level: LevelState, timeMillis: number) {
            if (this._bounceA != null) {
                this._velocityAPX = this._bounceA;
            }
            if (this._onGround) {

                // fly at the player
                var players = level.getGroup(GroupId.Player);
                var foundPlayer = false;


                var mb = this.getBounds();
                var mr = mb.getCenterRadiusPx();
                var ma = mb.getCenterAngleRadians();
                var msin = Math.sin(ma);
                var mcos = Math.cos(ma);

                var mx = mcos * mr;
                var my = msin * mr;

                if (this._targetX == null) {
                    this._targetX = mx;
                }
                if (this._targetY == null) {
                    this._targetY = my;
                }

                var targetX: number;
                var targetY: number;

                if (players && players.length > 0) {
                    var player = players[0];
                    var pb = player.entity.getBounds();
                    var pr = pb.getCenterRadiusPx();
                    var pa = pb.getCenterAngleRadians();
                    var psin = Math.sin(pa);
                    var pcos = Math.cos(pa);

                    targetX = pcos * pr;
                    targetY = psin * pr;
                    foundPlayer = true;
                } else {
                    targetX = this._targetX;
                    targetY = this._targetY;
                }

                var dx = targetX - mx;
                var dy = targetY - my;

                var dsq = dx * dx + dy * dy;

                if (dsq > this._searchRadius * this._searchRadius && foundPlayer) {
                    targetX = this._targetX;
                    targetY = this._targetY;
                    dx = targetX - mx;
                    dy = targetX - my;
                    dsq = dx * dx + dy * dy;
                } else {
                    this._targetX = targetX;
                    this._targetY = targetY;
                }

                // search!
                var d = Math.sqrt(dsq);
                var sdx = dx / d;
                var sdy = dy / d;
                var rp = PolarPoint.rotate(sdx, sdy, -ma);

                var drpx = rp.x;
                var dapx = rp.y * this._acceleration;

                this._velocityAPX += dapx;
                this._velocityAPX = Math.max(-this._maxVelocityAPx, Math.min(this._maxVelocityAPx, this._velocityAPX));

                if (drpx < 0) {
                    this._velocityRPX += this._smallJumpVelocity;
                } else {
                    this._velocityRPX += this._smallJumpVelocity + (this._bigJumpVelocity - this._smallJumpVelocity) * drpx;
                }
            }

            this._prevVelocityAPX = this._velocityAPX;
            this._bounceA = null;
            this._onGround = false;
        }

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void {
            if (withEntity instanceof BulletEntity) {
                // we're dead
                this.setDying(withEntity);
            } else {
                // assume it's a wall
                if (onEdge == PolarEdge.Left || onEdge == PolarEdge.Right) {
                    // do a bounce on a
                    this._bounceA = -this._prevVelocityAPX * this._bounce;
                } else if (onEdge == PolarEdge.Bottom) {
                    // do a bounce on r
                    this._onGround = true;
                }
            }
        }

    }

}