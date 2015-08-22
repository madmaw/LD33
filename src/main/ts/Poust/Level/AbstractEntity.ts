module Poust.Level {

    export class AbstractEntity implements IEntity {

        private _dead: boolean;
        private _sensor: boolean;
        public _bounds: PolarBounds;
        public _continuousCollisions: boolean;

        public constructor(private _groupId: GroupId) {
            this._dead = false;
            this._sensor = false;
            this._continuousCollisions = false;
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
            return new Poust.Level.Motion.SimpleMotion(this.getBounds(), this);
        }

        notifyCollision(withEntity: IEntity, onEdge: PolarEdge): void {

        }

        update(level: LevelState, timeMillis: number): void {

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

        public setSensor(sensor: boolean): void {
            this._sensor = sensor;
        }

        public isContinuousCollisions() {
            return this._continuousCollisions;
        }
    }

}