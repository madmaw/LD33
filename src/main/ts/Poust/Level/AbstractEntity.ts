class AbstractEntity implements IEntity {

    public dead: boolean;
    public bounds: PolarBounds;
    public continuousCollisions: boolean;
    public collidable: boolean;
    public state: string;
    public stateAgeMillis: number;
    public mass: number;
    public gravityMultiplier: number;
    public respectsGravityTimeout: number;
    public velocityRPX: number;
    public fallSound: ISound;

    public constructor(public groupId: number) {
        this.dead = false;
        this.velocityRPX = 0;
        this.continuousCollisions = false;
        this.collidable = true;

        this.stateAgeMillis = 0;
    }

    public setState(state: string, force?: boolean) {
        if (this.state != state || force) {
            this.state = state;
            this.stateAgeMillis = 0;
        }
    }

    getVelocityRadiusPX(): number {
        return this.velocityRPX;
    }

    setVelocityRadiusPX(velocityRadiusPX: number): void {
        // ignore!
        this.velocityRPX = velocityRadiusPX;
    }

    getVelocityAngleRadians(atRadiusPX: number): number {
        return 0;
    }

    getVelocityAnglePX(atRadiusPX: number): number {
        return 0;
    }

    setVelocityAngleRadians(velocityAngleRadians: number, atRadiusPX: number): void {
        // ignore!
    }

    setAnchorRight(anchorRight: boolean): void {
        // we don't care, we're always anchored absolutely
    }



    calculateMotion(timeMillis: number): IMotion {
        var bounds = this.bounds;
        var newBounds: PolarBounds;
        if (this.velocityRPX) {
            var rpx = this.velocityRPX * timeMillis;

            var r = bounds.innerRadiusPx + rpx;
            newBounds = new PolarBounds(r, bounds.startAngleRadians, bounds.heightPx, bounds.widthRadians);
        } else {
            newBounds = bounds;
        }
        return new PolarMotion(newBounds, this);
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {

    }

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        this.stateAgeMillis += timeMillis;
        if (this.respectsGravityTimeout != null) {
            if (this.respectsGravityTimeout > 0) {
                this.respectsGravityTimeout -= timeMillis;
                if (this.fallSound && this.respectsGravityTimeout <= 0) {
                    this.fallSound(0.1);
                }
            }
        }
        if ((!this.respectsGravityTimeout || this.respectsGravityTimeout < 0) && this.gravityMultiplier) {
            // TODO this formula for centripital force isn't right (should be more the smaller the radius)
            this.velocityRPX -= timeMillis * (level.getGravity() * this.gravityMultiplier / (Math.abs(this.getVelocityAnglePX(this.bounds.innerRadiusPx)) + 1));
        }
        if (this.bounds.getOuterRadiusPx() <= 0) {
            // welp, we're dead now!?
            this.dead = true;
        }
    }
}
