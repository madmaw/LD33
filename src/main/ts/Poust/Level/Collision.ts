module Poust.Level {

    export class Collision {

        public constructor(
            public sensorCollision: boolean,
            public collisionTime: number,
            public nearestCollisionIntersection: PolarBounds,
            public entityHolder1: EntityHolder,
            public bestMotion1: IMotion,
            public collisionMotion1: IMotion,
            public entityHolder2: EntityHolder,
            public bestMotion2: IMotion,
            public collisionMotion2: IMotion
        ) {

        }

        

    }

}