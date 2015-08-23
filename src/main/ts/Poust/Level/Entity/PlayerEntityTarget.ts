module Poust.Level.Entity {

    export class PlayerEntityTarget {

        public jumped: boolean;

        // TODO this should be x and y to counter for the rotation!
        public constructor(public jumping: boolean, public r: number, public a: number) {

        }

    }

}