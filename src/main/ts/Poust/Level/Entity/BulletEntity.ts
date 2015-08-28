module Poust.Level.Entity {

    export class BulletEntity extends AbstractCartesianEntity {

        private _lifeRemainingMillis: number;

        public constructor(groupId: GroupId, widthPx: number, heightPx: number, mass: number, private _lifespanMillis: number) {
            super(groupId, widthPx, heightPx, mass);
            this._lifeRemainingMillis = this._lifespanMillis;
            this._continuousCollisions = true;
        }

        update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
            super.update(level, timeMillis, createdEntities);
            this._lifeRemainingMillis -= timeMillis;
            if (this._lifeRemainingMillis < 0) {
                this.setDead();
            }
        }

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void {
            // just die
            this.setDead();
        }

    }

}