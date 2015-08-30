interface IEntity {

    getGroupId(): number;

    getBounds(): PolarBounds;

    getVelocityRadiusPX(): number;

    setVelocityRadiusPX(velocityRadiusPX: number): void;

    getVelocityAngleRadians(atRadiusPX: number): number;

    setVelocityAngleRadians(velocityAngleRadians: number, atRadiusPX: number): void;

    setAnchorRight(anchorRight: boolean): void;

    getMass(): number;

    calculateMotion(timeMillis: number): IMotion;

    notifyCollision(withEntity: IEntity, onEdge: number): void;

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void;

    isDead(): boolean;

    isCollidable(): boolean;

    isSensor(): boolean;

    isContinuousCollisions(): boolean;

    getState(): string;

    getStateAgeMillis(): number;
}
