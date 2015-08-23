module Poust.Level {

    export class AbstractEntity implements IEntity {

        private _dead: boolean;
        private _sensor: boolean;
        public _bounds: PolarBounds;
        public _continuousCollisions: boolean;
        public _collidable: boolean;
        public _state: string;
        public _stateAgeMillis: number;

        public constructor(private _groupId: GroupId) {
            this._dead = false;
            this._sensor = false;
            this._continuousCollisions = false;
            this._collidable = true;

            this._stateAgeMillis = 0;
        }

        public setState(state: string, force?: boolean) {
            if (this._state != state || force) {
                this._state = state;
                this._stateAgeMillis = 0;
            }
        }

        public getState(): string {
            return this._state;
        }

        public getStateAgeMillis(): number {
            return this._stateAgeMillis;
        }

        getGroupId(): GroupId {
            return this._groupId;
        }

        getBounds(): PolarBounds {
            return this._bounds;
        }

        getVelocityRadiusPX(): number {
            return 0;
        }

        setVelocityRadiusPX(velocityRadiusPX: number): void {
            // ignore!
        }

        getVelocityAngleRadians(atRadiusPX: number): number {
            return 0;
        }

        setVelocityAngleRadians(velocityAngleRadians: number, atRadiusPX: number): void {
            // ignore!
        }

        setAnchorRight(anchorRight: boolean): void {
            // we don't care, we're always anchored absolutely
        }



        getMass(): number {
            // infinity!
            return null;
        }



        calculateMotion(timeMillis: number): IMotion {
            return new Poust.Level.Motion.PolarMotion(this.getBounds(), this);
        }

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void {

        }

        update(level: LevelState, timeMillis: number): void {
            this._stateAgeMillis += timeMillis;
            if (this._bounds.getInnerRadiusPx() <= 0) {
                // welp, we're dead now!?
                this.setDead();
            }

        }

        isDead(): boolean {
            return this._dead;
        }

        public setDead(): void {
            this._dead = true;
        }

        isSensor(): boolean {
            return this._sensor;
        }

        isCollidable(): boolean {
            return this._collidable;
        }

        public setSensor(sensor: boolean): void {
            this._sensor = sensor;
        }

        public isContinuousCollisions() {
            return this._continuousCollisions;
        }
    }

}