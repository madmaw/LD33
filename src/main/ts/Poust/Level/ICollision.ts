

interface ICollision {

    collisionTime: number;
    nearestCollisionIntersection: PolarBounds;
    entityHolder1: IEntityHolder;
    bestMotion1: IMotion;
    collisionMotion1: IMotion;
    entityHolder2: IEntityHolder;
    bestMotion2: IMotion;
    collisionMotion2: IMotion;

}

