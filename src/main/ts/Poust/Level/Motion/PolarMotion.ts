class PolarMotion implements IMotion {

    public constructor(private _bounds: PolarBounds, private _entity: AbstractEntity) {
    }

    getBounds(): PolarBounds {
        return this._bounds;
    }

    getEntity(): IEntity {
        return this._entity;
    }

    apply(state: LevelState): void {
        this._entity._bounds = this._bounds;
    }
}
