module Poust.Level.Factory {

    export interface IEntitySpawner {

        (a: number, r: number, maxHeight: number, arc: number, difficulty: number): IEntity[];

    }

}