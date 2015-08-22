module Poust.Level {

    export interface IEntity {

        getGroupId(): GroupId;

        getBounds(): PolarBounds;

        getVelocityRadiusPX(): number;

        setVelocityRadiusPX(velocityRadiusPX: number): void;

        getVelocityAngleRadians(atRadiusPX: number): number;

        setVelocityAngleRadians(velocityAngleRadians: number, atRadiusPX: number): void;

        setAnchorRight(anchorRight: boolean): void;

        getMass(): number;

        calculateMotion(timeMillis: number): IMotion;

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void;

        update(level: LevelState, timeMillis: number): void;

        isDead(): boolean;

        isSensor(): boolean;

        isContinuousCollisions(): boolean;
    }

}