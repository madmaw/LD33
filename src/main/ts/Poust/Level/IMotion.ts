module Poust.Level {

    export interface IMotion {

        getBounds(): PolarBounds;

        getEntity(): IEntity;

        apply(): void;
    }

}