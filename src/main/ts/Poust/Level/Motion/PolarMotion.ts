class PolarMotion implements IMotion {

    public constructor(public bounds: PolarBounds, public entity: AbstractEntity) {
    }

    apply(state: LevelState): void {
        this.entity.bounds = this.bounds;
    }
}
