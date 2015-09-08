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
        var ri1 = b1.innerRadiusPx;
        var ro1 = b1.getOuterRadiusPx();
        var as1 = b1.startAngleRadians;
        var ae1 = b1.getEndAngleRadians();

        var ri2 = b2.innerRadiusPx;
        var ro2 = b2.getOuterRadiusPx();
        var as2 = b2.startAngleRadians;
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
        var minr = Math.min(b1.innerRadiusPx, b2.innerRadiusPx);
        var mina = Math.min(b1.startAngleRadians, b2.startAngleRadians);
        var maxr = Math.max(b1.getOuterRadiusPx(), b2.getOuterRadiusPx());
        var maxa = Math.max(b1.getEndAngleRadians(), b2.getEndAngleRadians());
        return new PolarBounds(minr, mina, maxr - minr, maxa - mina, false);
    }

    public constructor(public innerRadiusPx: number, public startAngleRadians: number, public heightPx: number, public widthRadians: number, normalize: boolean = true) {
        if (normalize) {
            this.normalize();
        }
    }

    public containsVertically(rPx: number): boolean {
        return this.innerRadiusPx <= rPx && this.innerRadiusPx + this.heightPx > rPx;
    }

    public containsHorizontally(aRadians: number): boolean {
        var naRadians = PolarBounds.normalizeAngle(aRadians);
        return this.startAngleRadians <= naRadians && this.startAngleRadians + this.widthRadians > naRadians;
    }

    public getOuterRadiusPx(): number {
        return this.innerRadiusPx + this.heightPx;
    }

    getCenterRadiusPx(): number {
        return this.innerRadiusPx + this.heightPx / 2;
    }

    public getEndAngleRadians(): number {
        return this.startAngleRadians + this.widthRadians;
    }

    public getCenterAngleRadians(): number {
        return this.startAngleRadians + this.widthRadians / 2;
    }

    public getOuterCircumferencePx(): number {
        var r = this.getOuterRadiusPx();
        return r * this.widthRadians; 
    }

    public getInnerCircumferencePx(): number {
        return this.innerRadiusPx * this.widthRadians;
    }

    public normalize(): void {
        // ensure that our angles are between 0 and 2 * PI
        this.startAngleRadians = PolarBounds.normalizeAngle(this.startAngleRadians);
    }

    public permutate(): PolarBounds[]{
        var ea = this.getEndAngleRadians();
        var result = [this];
        if (ea > pi2) {
            result.push(new PolarBounds(this.innerRadiusPx, this.startAngleRadians - pi2, this.heightPx, this.widthRadians, false));
        }
        return result;
    }

    public overlaps(bounds: PolarBounds): boolean {
        return PolarBounds.intersect(this, bounds) != null;
    }
}

