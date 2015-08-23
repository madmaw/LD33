module Poust.Level.Entity {

    export class BouncyEntity extends AbstractLivingPolarEntity {

        constructor(groupId: GroupId, mass: number, deathSound: ISound, private _velocity: number, private _goingUp: boolean, private _goingLeft: boolean) {
            super(groupId, mass, false, deathSound);
        }

        updateAlive(level: LevelState, timeMillis: number) {
            if (this._goingLeft) {
                this._velocityAPX = -this._velocity;
            } else {
                this._velocityAPX = this._velocity;
            }
            if (this._goingUp) {
                this._velocityRPX = this._velocity;
            } else {
                this._velocityRPX = -this._velocity;
            }
        }

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void {
            if (withEntity instanceof BulletEntity) {
                // we're dead
                this.setDying(withEntity);
            } else {
                // assume it's a wall
                if (onEdge == PolarEdge.Left) {
                    this._goingLeft = false;
                } else if (onEdge == PolarEdge.Right) {
                    this._goingLeft = true;
                } else if (onEdge == PolarEdge.Bottom) {
                    this._goingUp = true;
                } else if (onEdge == PolarEdge.Top) {
                    this._goingUp = false;
                }
            }
        }


    }

}