class AbstractLivingPolarEntity extends AbstractPolarEntity {

    public static STATE_DYING = "d";

    public _health: number;
    private _stunTimeout: number;

    constructor(groupId: number, mass: number, respectsGravity: boolean, private _deathSound: ISound) {
        super(groupId, mass, respectsGravity);
        this._health = 1;
        this._stunTimeout = 0;
    }

    public takeDamage() {
        if (this._health) {
            if (this._stunTimeout <= 0) {
                // halve size
                this._health--;
                this._heightPx /= 1.5;
                this._widthPx /= 1.5;
                this.mass /= 2;
                this._stunTimeout += 500;
            }
            this._deathSound(1 - (this._health / 10));
        }
    }

    public isDying(): boolean {
        return !this._health;
    }

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        var dying = this.isDying();
        super.update(level, timeMillis, createdEntities);
        
        if (dying) {
            this.collidable = false;
            this.setState(AbstractLivingPolarEntity.STATE_DYING);
        } else if (this._stunTimeout > 0) {
            this._stunTimeout -= timeMillis;
        } else if (this.dead) {
            // we're not dying, but we're dead?! probably fell off the bottom of the world, play the death sound
            this._deathSound(1);
        } else {
            this.updateAlive(level, timeMillis, createdEntities);
        }
    }

    updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        return null;
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        this._handleCollision(withEntity, onEdge);
        // nasty hack, we want gravity now so collision results look natural!! mostly for chompers.
        this.respectsGravityTimeout = 0;
    }

    public _handleCollision(withEntity: IEntity, onEdge: number): boolean {
        if (withEntity instanceof BulletEntity) {
            // we're dead
            this.takeDamage();
            return true;
        }

    }
}