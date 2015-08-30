class FlappyEntity extends AbstractLivingPolarEntity {

    public static STATE_FLAP = "flap";

    private _flapAnyway: boolean;

    constructor(groupId: number, mass: number, deathSound: ISound, private _goingLeft: boolean, private _lateralVelocity: number, private _flapVelocity: number, private _minRadius: number) {
        super(groupId, mass, true, deathSound);
    }

    updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        if (this._goingLeft) {
            this._velocityAPX = -this._lateralVelocity;
        } else {
            this._velocityAPX = this._lateralVelocity;
        }
        if (this.getBounds().getInnerRadiusPx() < this._minRadius || this._flapAnyway) {
            this._velocityRPX = this._flapVelocity;
            this.setState(FlappyEntity.STATE_FLAP, true);
        }
        this._flapAnyway = false;
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        if (withEntity instanceof BulletEntity) {
            // we're dead
            this.setDying(withEntity);
        } else {
            // assume it's a wall
            if (onEdge == PolarEdge.Left) {
                this._goingLeft = false;
            } else if (onEdge == PolarEdge.Right) {
                this._goingLeft = true;
            } else if (onEdge == PolarEdge.Bottom) {
                this._flapAnyway = true;
            }
        }
    }


}
