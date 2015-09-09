interface IEntity {

    groupId: number;

    bounds: PolarBounds;

    getVelocityRadiusPX(): number;

    setVelocityRadiusPX(velocityRadiusPX: number): void;

    getVelocityAngleRadians(atRadiusPX: number): number;

    setVelocityAngleRadians(velocityAngleRadians: number, atRadiusPX: number): void;

    setAnchorRight(anchorRight: boolean): void;

    mass: number;

    calculateMotion(timeMillis: number): IMotion;

    notifyCollision(withEntity: IEntity, onEdge: number): void;

    update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void;

    dead: boolean;

    collidable: boolean;

    continuousCollisions: boolean;

    state: string;

    stateAgeMillis: number;

    horizontalFriction?: number;
}
