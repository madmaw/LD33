class AbstractPolarEntity implements IEntity {

    public dead: boolean;
    public bounds: PolarBounds;
    public continuousCollisions: boolean;
    public ghostly: boolean;
    public state: string;
    public stateAgeMillis: number;
    public mass: number;
    public gravityMultiplier: number;
    public respectsGravityTimeout: number;
    public velocityRPX: number;
    public velocityAPX: number;
    public fallSound: ISound;
    public anchor: number;
    public widthPx: number;

    public constructor(public groupId: number = GROUP_ID_TERRAIN, public entityTypeId: number = ENTITY_TYPE_ID_TERRAIN) {
        this.velocityAPX = 0;
        this.velocityRPX = 0;
        this.stateAgeMillis = 0;
    }

    public setState(state: string, force?: boolean) {
        if (this.state != state || force) {
            this.state = state;
            this.stateAgeMillis = 0;
        }
    }


    public setVelocity(velocityRPX: number, velocityAPX: number) {
        this.velocityRPX = velocityRPX;
        this.velocityAPX = velocityAPX;
    }

    getVelocityRadiusPX(): number {
        return this.velocityRPX;
    }

    setVelocityRadiusPX(velocityRadiusPX: number): void {
        // ignore!
        this.velocityRPX = velocityRadiusPX;
    }

    getVelocityAngleRadians(atRadiusPX: number): number {
        return this.velocityAPX / atRadiusPX;
    }

    getVelocityAnglePX(atRadiusPx: number): number {
        return this.velocityAPX;
    }

    setVelocityAngleRadians(velocityAngleRadians: number, atRadiusPX: number): void {
        this.velocityAPX = velocityAngleRadians * atRadiusPX;
    }

    calculateMotion(timeMillis: number): IMotion {
        var bounds = this.bounds;

        // handle lateral velocity
        var rpx = this.velocityRPX * timeMillis;

        var r = bounds.innerRadiusPx + rpx;

        var a: number;
        if (this.widthPx) {
            var apx = this.velocityAPX * timeMillis;
            var ar = apx / r;
            var wr = this.widthPx / r;
            if (this.anchor > 0) {
                a = bounds.getEndAngleRadians() - wr;
            } else if (this.anchor < 0) {
                a = bounds.startAngleRadians;
            } else {
                a = bounds.getCenterAngleRadians() - wr/2;
            }
            a += ar;
        } else {
            wr = bounds.widthRadians;
            a = bounds.startAngleRadians;
        }

        return new PolarMotion(new PolarBounds(r, a, bounds.heightPx, wr), this);
    }

    public setBounds(r: number, a: number, heightPx?: number, widthPx?: number) {
        if (widthPx) {
            this.widthPx = widthPx;
        } else {
            widthPx = this.widthPx;
        }
        if (!heightPx) {
            heightPx = this.bounds.heightPx;
        }
        var wr = widthPx / r;
        this.bounds = new PolarBounds(r, a, heightPx, wr);
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {

    }

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        this.stateAgeMillis += timeMillis;
        if (this.respectsGravityTimeout != null) {
            if (this.respectsGravityTimeout > 0) {
                this.respectsGravityTimeout -= timeMillis;
                if (this.fallSound && this.respectsGravityTimeout <= 0) {
                    this.fallSound(0.5 + this.bounds.innerRadiusPx /2000);
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

