class AbstractPolarEntity extends AbstractEntity {

    public _velocityAPX: number;
    private _anchorRight: boolean;
    public _widthPx: number;
    public _heightPx: number;

    public constructor(_groupId: number, mass: number, respectsGravity: boolean) {
        super(_groupId);
        this.mass = mass;
        if (respectsGravity) {
            this.gravityMultiplier = 1;
        }
        this._velocityAPX = 0;
        this._anchorRight = false;
    }

    public setVelocity(velocityRPX: number, velocityAPX: number) {
        this.velocityRPX = velocityRPX;
        this._velocityAPX = velocityAPX;
    }

    getVelocityAngleRadians(atRadiusPX: number): number {
        return this._velocityAPX / atRadiusPX;
    }

    getVelocityAnglePX(atRadiusPx: number): number {
        return this._velocityAPX;
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


    calculateMotion(timeMillis: number): IMotion {
        var bounds = this.bounds;

        // handle lateral velocity
        var apx = this._velocityAPX * timeMillis;
        var rpx = this.velocityRPX * timeMillis;

        var r = bounds.innerRadiusPx + rpx;

        var ar = apx / r;
        var wr = this._widthPx / r;
        var a: number;
        if (this._anchorRight) {
            a = bounds.getEndAngleRadians() - wr;
        } else {
            a = bounds.startAngleRadians;
        }
        a += ar;

        return new PolarMotion(new PolarBounds(r, a, this._heightPx, wr), this);
    }

    public calculateBounds(r: number, a: number, heightPx: number, widthPx: number): PolarBounds {
        var wr = this._widthPx / r;
        var bounds = new PolarBounds(r, a, this._heightPx, wr);
        return bounds;
    }

    public setBounds(r: number, a: number, heightPx?: number, widthPx?: number) {
        if (widthPx) {
            this._widthPx = widthPx;
        }
        if (heightPx) {
            this._heightPx = heightPx;
        }
        this.bounds = this.calculateBounds(r, a, heightPx, widthPx);
    }


}

