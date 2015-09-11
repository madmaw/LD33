class FlappyEntity extends AbstractLivingPolarEntity {

    public static STATE_FLAP = "flap";

    private _flapAnyway: boolean;

    constructor(groupId: number, deathSound: ISound, private _goingLeft: boolean, private _lateralVelocity: number, private _flapVelocity: number, private _minRadius: number) {
        super(groupId, ENTITY_TYPE_ID_FLAPPY, deathSound);
        this.mass = 1;
        this.gravityMultiplier = 1;
    }

    updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        if (this._goingLeft) {
            this.velocityAPX = -this._lateralVelocity;
        } else {
            this.velocityAPX = this._lateralVelocity;
        }
        if (this.bounds.innerRadiusPx < this._minRadius || this._flapAnyway) {
            this.velocityRPX = this._flapVelocity;
            this.setState(FlappyEntity.STATE_FLAP, true);
        }
        this._flapAnyway = false;
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        this._handleCollision(withEntity, onEdge);
        // assume it's a wall
        if (onEdge == POLAR_EDGE_LEFT) {
            this._goingLeft = false;
        } else if (onEdge == POLAR_EDGE_RIGHT) {
            this._goingLeft = true;
        } else if (onEdge == POLAR_EDGE_BOTTOM) {
            this._minRadius++;
        } else {
            this._minRadius--;
        }
    }


}
