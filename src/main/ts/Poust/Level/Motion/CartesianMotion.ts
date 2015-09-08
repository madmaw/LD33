class CartesianMotion implements IMotion {

    public constructor(private _cx: number, private _cy: number, public bounds: PolarBounds, public entity: AbstractCartesianEntity) {

    }

    apply(state: LevelState): void {
        this.entity.setCenter(this._cx, this._cy);
    }


}

