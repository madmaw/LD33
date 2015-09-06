class PolarBounds {

    public static isClockwiseAfter(ca: number, a: number): boolean {
        // normalize the diff
        while (a > ca + pi) {
            a -= pi2;
        }
        while (a < ca - pi) {
            a += pi2;
        }
        return a > ca;
    }

    public static subtractAngle(a1: number, a2: number): number {
        while (a2 > a1 + pi) {
            a2 -= pi2;
        }
        while (a2 < a1 - pi) {
            a2 += pi2;
        }
        return a1 - a2;
    }

    public static normalizeAngle(angle: number): number {
        while (angle < 0) {
            angle += pi2;
        }
        return angle % (pi2);
    }

    public static intersect(b1: PolarBounds, b2: PolarBounds): PolarBounds {
        var p1s = b1.permutate();
        var p2s = b2.permutate();
        for (var i in p1s) {
            var p1 = p1s[i];
            for (var j in p2s) {
                var p2 = p2s[j];
                var s = PolarBounds.reallyIntersects(p1, p2);
                if (s) {
                    return s;
                }
            }
        }
        return null;
    }

    private static reallyIntersects(b1: PolarBounds, b2: PolarBounds): PolarBounds {
        var ri1 = b1.getInnerRadiusPx();
        var ro1 = b1.getOuterRadiusPx();
        var as1 = b1.getStartAngleRadians();
        var ae1 = b1.getEndAngleRadians();

        var ri2 = b2.getInnerRadiusPx();
        var ro2 = b2.getOuterRadiusPx();
        var as2 = b2.getStartAngleRadians();
        var ae2 = b2.getEndAngleRadians();

        // check the overlaps
        var rio = Math.max(ri1, ri2);
        var roverlap = Math.min(ro1, ro2) - rio;
        if (roverlap > 0) {
            var aso = Math.max(as1, as2);
            var aoverlap = Math.min(ae1, ae2) - aso;

            if (aoverlap > 0) {
                return new PolarBounds(rio, aso, roverlap, aoverlap, false);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public static union(b1: PolarBounds, b2: PolarBounds): PolarBounds {
        var minr = Math.min(b1._r, b2._r);
        var mina = Math.min(b1._a, b2._a);
        var maxr = Math.max(b1.getOuterRadiusPx(), b2.getOuterRadiusPx());
        var maxa = Math.max(b1.getEndAngleRadians(), b2.getEndAngleRadians());
        return new PolarBounds(minr, mina, maxr - minr, maxa - mina, false);
    }

    public constructor(public _r: number, public _a: number, public _height: number, public _arc: number, normalize: boolean = true) {
        if (normalize) {
            this.normalize();
        }
    }

    public containsVertically(rPx: number): boolean {
        return this._r <= rPx && this._r + this._height > rPx;
    }

    public containsHorizontally(aRadians: number): boolean {
        var naRadians = PolarBounds.normalizeAngle(aRadians);
        return this._a <= naRadians && this._a + this._arc > naRadians;
    }

    public getInnerRadiusPx(): number {
        return this._r;
    }

    public getHeightPx(): number {
        return this._height;
    }

    public getOuterRadiusPx(): number {
        return this._r + this._height;
    }

    public getStartAngleRadians(): number {
        return this._a;
    }

    getCenterRadiusPx(): number {
        return this._r + this._height / 2;
    }

    public getEndAngleRadians(): number {
        return this._a + this._arc;
    }

    public getCenterAngleRadians(): number {
        return this._a + this._arc / 2;
    }

    public getWidthRadians(): number {
        return this._arc;
    }

    public getOuterCircumferencePx(): number {
        var r = this.getOuterRadiusPx();
        return r * this._arc; 
    }

    public getInnerCircumferencePx(): number {
        var r = this.getInnerRadiusPx();
        return r * this._arc;
    }

    public normalize(): void {
        // ensure that our angles are between 0 and 2 * PI
        this._a = PolarBounds.normalizeAngle(this._a);
    }

    public permutate(): PolarBounds[]{
        var ea = this.getEndAngleRadians();
        var result = [this];
        if (ea > pi2) {
            result.push(new PolarBounds(this._r, this._a - pi2, this._height, this._arc, false));
        }
        return result;
    }

    public overlaps(bounds: PolarBounds): boolean {
        return PolarBounds.intersect(this, bounds) != null;
    }
}

