class AbstractCartesianEntity extends AbstractEntity {

    public _velocityDx: number;
    public _velocityDy: number;
    public _cx: number;
    public _cy: number;

    public constructor(groupId: number, private _widthPx: number, private _heightPx: number, private _mass: number) {
        super(groupId);
        this._velocityDx = 0;
        this._velocityDy = 0;
    }

    public getMass(): number {
        return this._mass;
    }

    public setCenter(cx: number, cy: number, bounds?: PolarBounds): void {
        this._cx = cx;
        this._cy = cy;
        if (!bounds) {
            bounds = this.calculateBounds(cx, cy);
        }
        this._bounds = bounds;
    }

    isSensor(): boolean {
        // has to be, cannot sensibly interact with collisions
        return true;
    }

    calculateBounds(cx: number, cy: number) {
        var a = Math.atan2(cy, cx);
        var r = Math.sqrt(cx * cx + cy * cy);

        var arcRad = this._widthPx / r;

        var newBounds = new PolarBounds(r - this._heightPx / 2, a - arcRad / 2, this._heightPx, arcRad);
        return newBounds;
    }

    calculateMotion(timeMillis: number): IMotion {
        var bounds = this.getBounds();

        var cx = this._cx + timeMillis * this._velocityDx;
        var cy = this._cy + timeMillis * this._velocityDy;

        var newBounds = this.calculateBounds(cx, cy);
        return new CartesianMotion(cx, cy, newBounds, this);
    }

    getVelocityRadiusPX(): number {
        var cx1 = this._cx + this._velocityDx;
        var cy1 = this._cy + this._velocityDy;
        
        var r = Math.sqrt(this._cx * this._cx + this._cy * this._cy);

        var r1 = Math.sqrt(cx1 * cx1 + cy1 * cy1);

        return r1 - r;
        
    }

    getVelocityAngleRadians(atRadiusPX: number): number {
        var cx1 = this._cx + this._velocityDx;
        var cy1 = this._cy + this._velocityDy;

        var a1 = Math.atan2(cy1, cx1);
        var a = Math.atan2(this._cy, this._cx);

        return PolarBounds.subtractAngle(a1, a);
    }



}
