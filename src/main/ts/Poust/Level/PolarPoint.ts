class PolarPoint {

    public static getCartesianPoint(r: number, a: number): { x: number, y: number } {
        var sin = Math.sin(a);
        var cos = Math.cos(a);
        var x = cos * r;
        var y = sin * r;
        return { x: x, y: y };
    }

    public static getPolarPoint(x: number, y: number): PolarPoint {
        var a = Math.atan2(y, x);
        var h = Math.sqrt(x * x + y * y);
        return new PolarPoint(h, a);
    }

    public static rotate(x: number, y: number, a: number): { x: number, y: number } {
        var sin = Math.sin(a);
        var cos = Math.cos(a);
        var xr = x * cos - y * sin;
        var yr = x * sin + y * cos;
        return { x: xr, y: yr };
    }

    public constructor(public r: number, public a: number) {
    }

}

