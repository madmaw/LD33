module Poust.Level.Entity {

    export interface IGun {

        update(
            diffMillis: number,
            state: LevelState,
            onGround: boolean,
            r: number,
            a: number,
            vr: number, 
            va: number,
            targets: PolarPoint[], 
            createdEntities: IEntity[]
        ): PolarPoint;

    }

}