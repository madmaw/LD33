class AbstractLivingPolarEntity extends AbstractPolarEntity {

    public static STATE_DYING = "d";

    public _health: number;
    private _stunTimeout: number;
    private _justDamaged: boolean;

    constructor(groupId: number, entityTypeId: number, private _deathSound: ISound) {
        super(groupId, entityTypeId);
        this._health = 1;
        this._stunTimeout = 0;
    }

    public takeDamage() {
        if (this._health) {
            this._justDamaged = true;
        }
    }

    public isDying(): boolean {
        return !this._health;
    }

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        super.update(level, timeMillis, createdEntities);
        if (this._justDamaged) {
            this._justDamaged = false;
            var count = 2 + this.mass;
            var r = this.bounds.getCenterRadiusPx();
            var a = this.bounds.getCenterAngleRadians();
            var d = 10;

            while (count > 0) {
                count--;
                var blood = new AbstractPolarEntity(GROUP_ID_PLAYER, ENTITY_TYPE_ID_BLOOD);
                blood.ghostly = true;
                blood.gravityMultiplier = 1;
                blood.setBounds(r, a, d, d);
                blood.velocityAPX = Math.random() - 0.5;
                blood.velocityRPX = Math.random();
                createdEntities.push(blood);
            }
            if (this._stunTimeout <= 0) {
                // halve size
                this._health--;
                this.bounds.heightPx /= 1.5;
                this.widthPx /= 1.5;
                this.mass--;
                this._stunTimeout = 500;
            }
            this._deathSound(1 - (this._health / 10));
        }
        var dying = this.isDying();
        if (dying) {
            this.ghostly = true;
            this.gravityMultiplier = 1;
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

    public _handleCollision(withEntity: IEntity, onEdge: number): void {
        if (withEntity.entityTypeId == ENTITY_TYPE_ID_BULLET) {
            // we're dead
            this.takeDamage();
        }
    }
}