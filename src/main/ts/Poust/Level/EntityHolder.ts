module Poust.Level {

    export class EntityHolder {

        public motion: IMotion;

        public motionOffset: number;

        public constructor(public entity: IEntity, public renderer: IEntityRenderer) {

        }
    }

}