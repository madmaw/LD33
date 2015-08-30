interface IMotion {

    getBounds(): PolarBounds;

    getEntity(): IEntity;

    apply(state: LevelState): void;
}
