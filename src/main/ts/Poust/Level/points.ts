
function getCartesianPoint(r: number, a: number): ICartesianPoint {
    var sin = Math.sin(a);
    var cos = Math.cos(a);
    var x = cos * r;
    var y = sin * r;
    return { x: x, y: y };
}

function getPolarPoint(x: number, y: number): IPolarPoint {
    var a = Math.atan2(y, x);
    var h = Math.sqrt(x * x + y * y);
    return { r: h, a: a };
}

function rotate(x: number, y: number, a: number): ICartesianPoint {
    var sin = Math.sin(a);
    var cos = Math.cos(a);
    var xr = x * cos - y * sin;
    var yr = x * sin + y * cos;
    return { x: xr, y: yr };
}

interface IPolarPoint {
    r: number;
    a: number;
}

interface ICartesianPoint {
    x: number;
    y: number;
}
