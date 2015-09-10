class PolarMotion implements IMotion {

    public constructor(public bounds: PolarBounds, public entity: AbstractPolarEntity) {
    }

    apply(state: LevelState): void {
        this.entity.bounds = this.bounds;
    }
}
