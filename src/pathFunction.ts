import { Vector3 } from 'babylonjs';
import { memoize } from 'lodash';
import { FunctionBounds } from './calculationHelper';
import CalculationHelper from './calculationHelper';

export const bounds = {
    begin: 0,
    increment: 1 / 20,
    final: 40
}

const c = memoize(
    function c(s, d, t) {
        return d / s * t;
    }
);

const n0 = memoize(
    function n0(s, d, x) {
        return d * 27 * (x ** 3 - (3 / 2) * s * x ** 2) / (-4 * (3 / 2 * s) ** 3);
    }
);


const n1 = memoize(
    function n1(xp, x) {
        return (Math.atan(x / xp) + Math.PI / 2) / Math.PI;
    }
);

const n2 = memoize(
    function n2(x0, xp, x) {
        return n1(xp, x) - n1(xp, x0);
    }
);

const n3 = memoize(
    function n3(x0, x1, xp, x) {
        return n2(x0, xp, x + x0) / n2(x0, xp, x1);
    }
);

const n = memoize(
    function n(d, x0, x1, xp, x) {
        return n0(x1 + x0, d, (x1 + x0) * n3(-x0, x1, xp, x));
    }
);

const p1 = memoize(
    function p1(x0, x1, x) {
        if (x0 > x || x > x1) {
            throw new TypeError('P1 Domain Error.');
        }

        return ((x - x0) ** 2) * ((x - x1) ** 2) /
            (((x1 - x0) ** 2) * ((x0 - x1) ** 2) / 16);
    }
)

// V2 Functions
const g = memoize(
    function g(x) {
        return -14 * x / (x ** 2 + 1);
    }
);

const f = memoize(
    function f(x) {
        return g(x) - g(-4);
    }
);

const h = memoize(
    function h(x) {
        return CalculationHelper.integrateFunction(f, {
            begin: 0,
            final: x,
            increment: this.bounds.increment
        });
    }
);

const a = 5

const j = memoize(
    function j(x) {
        return a * (h(x/a - 4) - h(-4));
    }
);

const vx30 = memoize(
    function vx30(t) {
        return 5 / 2 * -Math.sin(1-t) * (10 ** Math.sin(1 - t));
    }
)
const vx30Vector = memoize(
    function vx30Vector(t) {
        return new Vector3(vx30(t), 0, 0);
    }
)
const vx30Helper = new CalculationHelper(vx30Vector, this.bounds);

const vy30 = memoize(
    function vy30(t) {
        return 5 / 2 * (1 - (1-t) ** Math.cos(1-t));
    }
)
const vy30Vector = memoize(
    function vx30Vector(t) {
        return new Vector3(0, vy30(t), 0);
    }
)
const vy30Helper = new CalculationHelper(vy30Vector, this.bounds);

const vx40Integrand = memoize(
    function vx50Integrand(u) {
        return Math.cos(u**2);
    }
)

const vy40Integrand = memoize(
    function vx50Integrand(u) {
        return Math.sin(u**2);
    }
)

const vx40 = memoize(
    function vx40(t) {
        return 15 * CalculationHelper.integrateFunction(vx40Integrand, {
            begin: 0,
            final: t,
            increment: bounds.increment
        });
    }
)
const vx40Vector = memoize(
    function vx40Vector(t) {
        return new Vector3(vx40(t), 0, 0);
    }
)
const vx40Helper = new CalculationHelper(vx40Vector, this.bounds);

const vy40 = memoize(
    function vx40(t) {
        return 15 * CalculationHelper.integrateFunction(vy40Integrand, {
            begin: 0,
            final: t,
            increment: bounds.increment
        });
    }
)
const vy40Vector = memoize(
    function vx30Vector(t) {
        return new Vector3(0, vy40(t), 0);
    }
)
const vy40Helper = new CalculationHelper(vy40Vector, this.bounds);

const vy31Integrand = memoize(
    function vy31Integrand(u) {
        return c(1, vy40Helper.derivativeMagnitude(-8.75) / vx40Helper.derivativeMagnitude(-8.75) -
            vy30Helper.derivativeMagnitude(1) / vx30Helper.derivativeMagnitude(1), vx30Helper.derivativeMagnitude(u))
    }
)

const vy31 = memoize(
    function vy31(t) {
        return vy30(t) + CalculationHelper.integrateFunction(vy31Integrand, {
            begin: 0,
            final: 0,
            increment: bounds.increment
        })
    }
)
const vy31Vector = memoize(
    function vy31Vector(t) {
        return new Vector3(0, vy31(t), 0);
    }
)
const vy31Helper = new CalculationHelper(vy31Vector, this.bounds);

const vy2integrand = memoize(
    function vy2integrand(u) {
        return c(25, vy31Helper.derivativeMagnitude(0)/vx30Helper.derivativeMagnitude(0), u);
    }
)

const vy2 = memoize(
    function vy2(t) {
        return CalculationHelper.integrateFunction(vy2integrand, {
            begin: 0,
            final: t,
            increment: bounds.increment
        })
    }
);

const vx2 = memoize(
    function vx2(t) {
        return t + 15
    }
)

const vx3 = memoize(
    function vx3(t) {
        return vx30(t) - vx30(0) + vx2(25)
    }
)

const vy3 = memoize(
    function vy3(t) {
        return vy31(t) - vy31(0) + vy2(25)
    }
)

const vx4 = memoize(
    function vx4(t) {
        return vx40(t) - vx40(-8.75) + vx3(1)
    }
)

const vy4 = memoize(
    function vy4(t) {
        return vy40(t) - vy40(-8.75) + vy3(1)
    }
)

export default function pathFunction(t) {
    if (t <= 15) {
        return new Vector3(t, 0, 0);
    } else /*if (t <= 15 + 25)*/ {
        return new Vector3(vx2(t - 15), 0, vy2(t - 15));
    }
}