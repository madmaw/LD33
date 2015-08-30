class AbstractPolarEntity extends AbstractEntity {

    public _velocityRPX: number;
    public _velocityAPX: number;
    private _anchorRight: boolean;
    private _widthPx: number;
    private _heightPx: number;

    public constructor(_groupId: number, private _mass: number, public _respectsGravity: boolean) {
        super(_groupId);
        this._velocityAPX = 0;
        this._velocityRPX = 0;
        this._anchorRight = false;
    }

    public setVelocity(velocityRPX: number, velocityAPX: number) {
        this._velocityRPX = velocityRPX;
        this._velocityAPX = velocityAPX;
    }

    getVelocityRadiusPX(): number {
        return this._velocityRPX;
    }

    setVelocityRadiusPX(velocityRadiusPX: number): void {
        this._velocityRPX = velocityRadiusPX;
    }

    getVelocityAngleRadians(atRadiusPX: number): number {
        return this._velocityAPX / atRadiusPX;
    }

    setVelocityAngleRadians(velocityAngleRadians: number, atRadiusPX: number): void {
        this._velocityAPX = velocityAngleRadians * atRadiusPX;
    }

    setAnchorRight(anchorRight: boolean): void {
        if (this._anchorRight != anchorRight) {
            // adjust the anchor point
            this._anchorRight = anchorRight;
        } 
    }


    getMass(): number {
        return this._mass;
    }


    calculateMotion(timeMillis: number): IMotion {
        var bounds = this.getBounds();

        var rpx = this._velocityRPX * timeMillis;
        var apx = this._velocityAPX * timeMillis;

        var r = bounds.getInnerRadiusPx() + rpx;

        var ar = apx / r;
        var wr = this._widthPx / r;
        var a: number;
        if (this._anchorRight) {
            a = bounds.getEndAngleRadians() - wr;
        } else {
            a = bounds.getStartAngleRadians();
        }
        a += ar;
        var newBounds = new PolarBounds(r, a, this._heightPx, wr);
        newBounds.normalize();
        return this._createMotion(newBounds);
    }

    public calculateBounds(r: number, a: number, heightPx: number, widthPx: number): PolarBounds {
        var wr = this._widthPx / r;
        var bounds = new PolarBounds(r, a, this._heightPx, wr);
        bounds.normalize();
        return bounds;
    }

    public setBounds(r: number, a: number, heightPx?: number, widthPx?: number) {
        if (widthPx) {
            this._widthPx = widthPx;
        }
        if (heightPx) {
            this._heightPx = heightPx;
        }
        var bounds = this.calculateBounds(r, a, heightPx, widthPx);
        this._bounds = bounds;
    }


    public _createMotion(bounds: PolarBounds) {
        return new PolarMotion(bounds, this);
    }

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        super.update(level, timeMillis, createdEntities);
        if (this._respectsGravity) {
            this._velocityRPX -= timeMillis * (level.getGravity() / (Math.abs(this._velocityAPX) + 1));
        }
    }

}

