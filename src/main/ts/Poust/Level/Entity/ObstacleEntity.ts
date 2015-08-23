module Poust.Level.Entity {

    export class ObstacleEntity extends AbstractPolarEntity {

        public constructor(groupId: GroupId, private _obstacleType: ObstacleType) {
            super(groupId, null, false);
            this.setSensor(true);
        }

        public getObstacleType() {
            return this._obstacleType;
        }
    }

}