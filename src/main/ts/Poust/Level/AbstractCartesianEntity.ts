class AbstractCartesianEntity extends AbstractPolarEntity {

    public _velocityDx: number;
    public _velocityDy: number;
    public _cx: number;
    public _cy: number;
    private _lifeRemainingMillis: number;


    public constructor(groupId: number, private _widthPx: number, private _heightPx: number, mass: number, private _lifespanMillis: number) {
        super(groupId, ENTITY_TYPE_ID_BULLET);
        this.mass = mass;
        this._velocityDx = 0;
        this._velocityDy = 0;
        this._lifeRemainingMillis = this._lifespanMillis;
        this.continuousCollisions = true;
    }

    public setCenter(cx: number, cy: number, bounds?: PolarBounds): void {
        this._cx = cx;
        this._cy = cy;
        if (!bounds) {
            bounds = this.calculateBounds(cx, cy);
        }
        this.bounds = bounds;
    }

    calculateBounds(cx: number, cy: number) {
        var a = Math.atan2(cy, cx);
        var r = Math.sqrt(cx * cx + cy * cy);

        var arcRad = this._widthPx / r;

        var newBounds = new PolarBounds(r - this._heightPx / 2, a - arcRad / 2, this._heightPx, arcRad);
        return newBounds;
    }

    calculateMotion(timeMillis: number): IMotion {
        var bounds = this.bounds;

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

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
        super.update(level, timeMillis, createdEntities);
        this._lifeRemainingMillis -= timeMillis;
        if (this._lifeRemainingMillis < 0) {
            this.dead = true;
        }
    }

    notifyCollision(withEntity: IEntity, onEdge: number): void {
        // just die
        this.dead = true;
    }

}
