class CartesianMotion implements IMotion {

    public constructor(private _cx: number, private _cy: number, private _bounds: PolarBounds, private _entity: AbstractCartesianEntity) {

    }

    getBounds(): PolarBounds {
        return this._bounds;
    }

    getEntity(): IEntity {
        return this._entity;
    }

    apply(state: LevelState): void {
        this._entity.setCenter(this._cx, this._cy);
    }


}

