module Poust.Level.Entity {

    export class AbstractLivingPolarEntity extends AbstractPolarEntity {

        public static STATE_DYING = "dying";

        private _dying: boolean;
        private _killedBy: IEntity;
        

        constructor(groupId: GroupId, mass: number, respectsGravity: boolean, private _deathSound: ISound) {
            super(groupId, mass, respectsGravity);
        }

        public setDying(killedBy: IEntity) {
            if (!this._dying) {
                this._dying = true;
                this._killedBy = killedBy;
                this._deathSound();
            }
        }

        public isDying() {
            return this._dying;
        }

        update(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
            super.update(level, timeMillis, createdEntities);
            if (!this.isDying()) {
                this.updateAlive(level, timeMillis, createdEntities);
            } else {
                this.updateDying(level, timeMillis);
            }
        }

        updateDying(level: LevelState, timeMillis: number) {
            if (this._collidable) {
                this.setState(AbstractLivingPolarEntity.STATE_DYING);
                this._collidable = false;
                this._respectsGravity = true;
                if (this._killedBy) {
                    var mass1 = this.getMass();
                    var mass2 = this._killedBy.getMass();
                    if (mass1 != null && mass2 != null) {
                        var vrpx1 = this.getVelocityRadiusPX();
                        var vrpx2 = this._killedBy.getVelocityRadiusPX();
                        var vapx1 = this._velocityAPX;
                        var va2 = this._killedBy.getVelocityAngleRadians(vrpx1);
                        var vapx2 = va2 * vrpx1;
                        var vrpx = (vrpx1 * mass1 + vrpx2 * mass2) / (mass1 + mass2);
                        var vapx = (vapx1 * mass1 + vapx2 * mass2) / (mass1 + mass2);

                        this._velocityRPX = vrpx;
                        this._velocityAPX = vapx;
                    } else {
                        this._velocityAPX = -this._velocityAPX;
                        this._velocityRPX = -this._velocityRPX;
                    }
                }

                
            }
            if (this.getBounds().getInnerRadiusPx() <= 0) {
                this.setDead();
            }
        }

        updateAlive(level: LevelState, timeMillis: number, createdEntities: IEntity[]): void {
            return null;
        }
    }


}