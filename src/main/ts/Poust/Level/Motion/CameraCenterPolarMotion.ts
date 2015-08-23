module Poust.Level.Motion {

    export class CameraCenterPolarMotion extends PolarMotion {
        public constructor(bounds: PolarBounds, entity: AbstractPolarEntity) {
            super(bounds, entity);
        }

        apply(state: LevelState): void {
            super.apply(state);
            var bounds = this.getBounds();
            state.setCameraCenter(bounds.getCenterRadiusPx(), bounds.getCenterAngleRadians());
        }

    }

}