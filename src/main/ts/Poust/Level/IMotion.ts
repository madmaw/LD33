interface IMotion {

    bounds: PolarBounds;

    entity: IEntity;

    apply(state: LevelState): void;
}
