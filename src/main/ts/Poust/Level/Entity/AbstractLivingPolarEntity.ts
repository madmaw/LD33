class AbstractLivingPolarEntity extends AbstractPolarEntity {

    public static STATE_DYING = "d";

    private _killedBy: IEntity;
    public _health: number;
    private _stunTimeout: number;

    constructor(groupId: number, mass: number, respectsGravity: boolean, private _deathSound: ISound) {
        super(groupId, mass, respectsGravity);
        this._health = 1;
        this._stunTimeout = 0;
    }

    public setDying(killedBy: IEntity) {
        this._killedBy = killedBy;
        if (this._health && this._stunTimeout <= 0) {
            // halve size
            this._health--;
            this._heightPx /= 1.5;
            this._widthPx /= 1.5;
            this._mass /= 2;
            this._stunTimeout += 500;
        }
        this._deathSound(1-(this._health/10));
    }

    public isDying(): boolean {
        return !this._health;
    }

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        super.update(level, timeMillis, createdEntities);
        if (this._killedBy) {
            this.flyAway(level, timeMillis);
            this.setSensor(false);
            this._killedBy = null;
        }
        if (this.isDying()) {
            this._collidable = false;
            this.setState(AbstractLivingPolarEntity.STATE_DYING);
        } else if (this._stunTimeout > 0) {
            this._stunTimeout -= timeMillis;
            if (this._stunTimeout <= 0) {
                this._velocityAPX = 0;
            }
        } else {
            this.updateAlive(level, timeMillis, createdEntities);
        }
    }

    flyAway(level: LevelState, timeMillis: number) {
        this._respectsGravity = true;
        if (this._killedBy) {
            var mass1 = this.getMass();
            var mass2 = this._killedBy.getMass();
            if (mass1 && mass2) {
                var cr = this.getBounds().getCenterRadiusPx();
                var vrpx1 = this.getVelocityRadiusPX();
                var vrpx2 = this._killedBy.getVelocityRadiusPX();
                var vapx1 = this._velocityAPX;
                var va2 = this._killedBy.getVelocityAngleRadians(cr);
                var vapx2 = va2 * cr;
                var vrpx = (vrpx1 * mass1 + vrpx2 * mass2) / (mass1 + mass2);
                var vapx = (vapx1 * mass1 + vapx2 * mass2) / (mass1 + mass2);

                this._velocityRPX = vrpx;
                this._velocityAPX = vapx;
            } else {
                this._velocityAPX = -this._velocityAPX;
                this._velocityRPX = -this._velocityRPX;
            }
        }
    }

    updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        return null;
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        this._handleCollision(withEntity, onEdge);
    }

    public _handleCollision(withEntity: IEntity, onEdge: number): boolean {
        if (withEntity instanceof BulletEntity) {
            // we're dead
            this.setDying(withEntity);
            return true;
        } else {
            return false;
        }

    }
}