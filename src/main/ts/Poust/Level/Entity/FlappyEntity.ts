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
        if (this.bounds.innerRadiusPx < this._minRadius || this._flapAnyway) {
            this.velocityRPX = this._flapVelocity;
            this.setState(FlappyEntity.STATE_FLAP, true);
        }
        this._flapAnyway = false;
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        if (!this._handleCollision(withEntity, onEdge) ) {
            // assume it's a wall
            if (onEdge == POLAR_EDGE_LEFT) {
                this._goingLeft = false;
            } else if (onEdge == POLAR_EDGE_RIGHT) {
                this._goingLeft = true;
            } else if (onEdge == POLAR_EDGE_BOTTOM) {
                this._flapAnyway = true;
            }
        }
    }


}
