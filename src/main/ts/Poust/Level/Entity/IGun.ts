module Poust.Level.Entity {

    export interface IGun {

        update(diffMillis: number, state: LevelState, onGround: boolean, r: number, a: number, targets: PolarPoint[]): PolarPoint;

    }

}