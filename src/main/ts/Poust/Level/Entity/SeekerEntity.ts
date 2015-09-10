class SeekerEntity extends AbstractLivingPolarEntity {

    private _bounceA: number;
    private _prevVelocityAPX: number;
    private _targetX: number;
    private _targetY: number;
    private _onGround: boolean;

    public constructor(
        groupId: number,
        deathSound: ISound,
        private _searchRadius: number,
        private _acceleration: number,
        private _bounce: number,
        private _maxVelocityAPx: number,
        private _smallJumpVelocity: number,
        private _bigJumpVelocity: number) {
        super(groupId, ENTITY_TYPE_ID_SEEKER, deathSound);
        this.mass = 1;
        this.gravityMultiplier = 1;
    }

    updateAlive(level: LevelState, timeMillis: number) {
        if (this._bounceA != null) {
            this.velocityAPX = this._bounceA;
        }
        if (this._onGround) {

            // fly at the player
            var players = level.getGroup(GROUP_ID_PLAYER);
            var foundPlayer = false;


            var mb = this.bounds;
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
                var pb = player.entity.bounds;
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
            var rp = rotate(sdx, sdy, -ma);

            var drpx = rp.x;
            var dapx = rp.y * this._acceleration;

            this.velocityAPX += dapx;
            this.velocityAPX = Math.max(-this._maxVelocityAPx, Math.min(this._maxVelocityAPx, this.velocityAPX));

            if (drpx < 0) {
                this.velocityRPX += this._smallJumpVelocity;
            } else {
                this.velocityRPX += this._smallJumpVelocity + (this._bigJumpVelocity - this._smallJumpVelocity) * drpx;
            }
        }

        this._prevVelocityAPX = this.velocityAPX;
        this._bounceA = null;
        this._onGround = false;
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        if (withEntity.entityTypeId == ENTITY_TYPE_ID_BULLET) {
            // we're dead
            this.takeDamage();
        } else {
            // assume it's a wall
            if (onEdge == POLAR_EDGE_LEFT || onEdge == POLAR_EDGE_RIGHT) {
                // do a bounce on a
                this._bounceA = -this._prevVelocityAPX * this._bounce;
            } else if (onEdge == POLAR_EDGE_BOTTOM) {
                // do a bounce on r
                this._onGround = true;
            }
        }
    }

}
