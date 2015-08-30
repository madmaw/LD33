class PlayerEntityTarget {

    public jumped: boolean;
    public shooting: boolean;

    // TODO this should be x and y to counter for the rotation!
    public constructor(public gestureHint: number, public sx: number, public sy: number) {

    }

}
