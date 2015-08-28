module Poust.Level.Entity {

    export class PlayerEntityTarget {

        public jumped: boolean;
        public shooting: boolean;

        // TODO this should be x and y to counter for the rotation!
        public constructor(public gestureHint: Gesture, public sx: number, public sy: number) {

        }

    }

}