class BouncyEntity extends AbstractLivingPolarEntity {

    constructor(groupId: number, deathSound: ISound, private _velocity: number, private _goingUp: boolean, private _goingLeft: boolean) {
        super(groupId, ENTITY_TYPE_ID_BOUNCY, deathSound);
        this.mass = 1;
    }

    updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        if (this._goingLeft) {
            this.velocityAPX = -this._velocity;
        } else {
            this.velocityAPX = this._velocity;
        }
        if (this._goingUp) {
            this.velocityRPX = this._velocity;
        } else {
            this.velocityRPX = -this._velocity;
        }
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        this._handleCollision(withEntity, onEdge)
        // assume it's a wall
        if (onEdge == POLAR_EDGE_LEFT) {
            this._goingLeft = false;
        } else if (onEdge == POLAR_EDGE_RIGHT) {
            this._goingLeft = true;
        } else if (onEdge == POLAR_EDGE_BOTTOM) {
            this._goingUp = true;
        } else if (onEdge == POLAR_EDGE_TOP) {
            this._goingUp = false;
        }
    }


}
