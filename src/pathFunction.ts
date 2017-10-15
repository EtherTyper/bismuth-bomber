import { Vector3 } from 'babylonjs';
import { memoize } from 'lodash';
import { FunctionBounds } from './calculationHelper';
import CalculationHelper from './calculationHelper';

const individualBounds = [
    [0, 15],
    [0, 25],
    [0, 1],
    [-8.75, Math.sqrt(61 * Math.PI / 2)],
    [0, 45.2],
    [-9 * Math.PI / 2, 6],
    [0, 23 * Math.PI],
    [0, 19.8]
]

let tRanges = []
let finalBounds = 0
for (const functionBounds of individualBounds) {
    const length = functionBounds[1] - functionBounds[0]

    tRanges.push({
        begin: finalBounds,
        length,
        subtract: finalBounds - functionBounds[0]
    })

    finalBounds += length
}

console.log(tRanges)

export const bounds = {
    begin: 0,
    increment: 1 / 10,
    final: finalBounds
}

const c = memoize(
    function c(s, d, t) {
        return d / s * t;
    }, function(...args) {
        return JSON.stringify(args);
    }
);

const n0 = memoize(
    function n0(s, d, x) {
        return d * 27 * (x ** 3 - (3 / 2) * s * x ** 2) / (-4 * (3 / 2 * s) ** 3);
    }, function(...args) {
        return JSON.stringify(args);
    }
);


const n1 = memoize(
    function n1(xp, x) {
        return (Math.atan(x / xp) + Math.PI / 2) / Math.PI;
    }, function(...args) {
        return JSON.stringify(args);
    }
);

const n2 = memoize(
    function n2(x0, xp, x) {
        return n1(xp, x) - n1(xp, x0);
    }, function(...args) {
        return JSON.stringify(args);
    }
);

const n3 = memoize(
    function n3(x0, x1, xp, x) {
        return n2(x0, xp, x + x0) / n2(x0, xp, x1);
    }, function(...args) {
        return JSON.stringify(args);
    }
);

const n = memoize(
    function n(d, x0, x1, xp, x) {
        return n0(x1 + x0, d, (x1 + x0) * n3(-x0, x1, xp, x));
    }, function(...args) {
        return JSON.stringify(args);
    }
);

const p1 = memoize(
    function p1(x0, x1, x) {
        if (x0 > x || x > x1) {
            throw new TypeError('P1 Domain Error.');
        }

        return ((x - x0) ** 2) * ((x - x1) ** 2) /
            (((x1 - x0) ** 2) * ((x0 - x1) ** 2) / 16);
    }, function(...args) {
        return JSON.stringify(args);
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
            increment: bounds.increment
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
const vx30Helper = new CalculationHelper(vx30Vector, bounds);

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
const vy30Helper = new CalculationHelper(vy30Vector, bounds);

const vx40Integrand = memoize(
    function (u) {
        return Math.cos(u**2);
    }
)

const vy40Integrand = memoize(
    function (u) {
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
const vx40Helper = new CalculationHelper(vx40Vector, bounds);

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
const vy40Helper = new CalculationHelper(vy40Vector, bounds);

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
const vy31Helper = new CalculationHelper(vy31Vector, bounds);

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

const vx50 = memoize(
    function vy50(t) {
        return (3/2)*(t**Math.cos(t))*Math.sin(t);
    }
)

const vx60 = memoize(
    (t) => 3*t
)
const vx60Vector = memoize(
    (t: number) => new Vector3(vx60(t), 0, 0)
)
const vx60Helper = new CalculationHelper(vx60Vector, bounds)

const vy60 = memoize(
    function(t) {
        return 6*Math.sin(3*t)
    }
)
const vy60Vector = memoize(
    (t: number) => new Vector3(0, 0, vy60(t))
)
const vy60Helper = new CalculationHelper(vy60Vector, bounds)

const vy5integrand = memoize(
    function vy51Integrand(t) {
        return c(45.2,
            (vy60Helper.derivativeMagnitude(6)/vx60Helper.derivativeMagnitude(6)) -
                (vy50Helper.derivativeMagnitude(45.2)/vx50Helper.derivativeMagnitude(45.2)), t) * vx50Helper.derivativeMagnitude(t)
    }
)

const vy50 = memoize(
    function vy50(t) {
        return 3*((t*((Math.cos(t-(Math.PI/2)))**2))**Math.sin(2*t))
    }
)

const vy51 = memoize(
    function vy51(t) {
        return vy50(t) + CalculationHelper.integrateFunction(vy5integrand, {
            begin: 0,
            final: t,
            increment: bounds.increment
        })
    }
)

const vx5 = memoize(
    function vy5(t) {
        return vx50(t) - vx50(0) + vx4((61*Math.PI/2)**(1/2))
    }
)

const vy5 = memoize(
    function vy5(t) {
        return vy51(t) - vy50(0) + vy4((61*Math.PI/2)**(1/2))
    }
)

const vy50Vector = memoize(
    function(t) {
        return new Vector3(0, vy50(t), 0);
    }
)
const vy50Helper = new CalculationHelper(vy50Vector, bounds);

const vx50Vector = memoize(
    function(t) {
        return new Vector3(vx50(t), 0, 0);
    }
)
const vx50Helper = new CalculationHelper(vx50Vector, bounds);

const vx6 = memoize(t => vx60(t) - vx60(0) + vx5(45.2))

const vy6 = memoize(t => vy60(t) - vy60(0) + vx5(45.2))

const vx7 = memoize(function(t) {
    return 50*Math.cos(24*Math.PI - Math.PI/2 - t)/(24*Math.PI - Math.PI/2 - t)
})
const vx7Vector = memoize(t => new Vector3(0, vx7(t), 0))
const vx7Helper = new CalculationHelper(vx7Vector, bounds);

const vy70 = memoize(function(t) {
    return 50*Math.sin(24*Math.PI - Math.PI/2 - t)/(24*Math.PI - Math.PI/2 - t)
})

const vy71 = memoize(t => vy70(t) - vy70(0));
const vy71Vector = memoize(t => new Vector3(0, vy71(t), 0))
const vy71Helper = new CalculationHelper(vy71Vector, bounds);

const vy7integrand = memoize(
    function vy7integrand(u) {
        return c(23*Math.PI, -vy71Helper.derivativeMagnitude(u) / vx7Helper.derivativeMagnitude(u), u) * vx7Helper.derivativeMagnitude(u);
    }
)

const vy7 = memoize(
    function vy7(t) {
        return vy71(t) + CalculationHelper.integrateFunction(vy7integrand, {
            begin: 0,
            final: t,
            increment: bounds.increment
        })
    }
)

const vy8 = memoize(
    function vy8(t) {
        const dividend = t ** 2 * (t - 3 / 2 * vx6(-9 * Math.PI / 2));
        const divisor = ((3 / 2 * vx6(-9 * Math.PI / 2)) ** 3) * (-4/27);
        const thing2 = vy6(-9 * Math.PI / 2) - vy7(23 * Math.PI);

        return dividend / divisor * thing2 + vy7(23 * Math.PI);
    }
)

const v1 = memoize(
    function v1(t) {
        return new Vector3(t, 0, 0);
    }
)
const v2 = memoize(
    function v2(t) {
        return new Vector3(vx2(t), 0, vy2(t));
    }
)
const v3 = memoize(
    function v3(t) {
        return new Vector3(vx3(t), 0, vy3(t));
    }
)
const v4 = memoize(
    function v4(t) {
        return new Vector3(vx4(t), 0, vy4(t));
    }
)
const v5 = memoize(
    function v4(t) {
        return new Vector3(vx5(t), 0, vy5(t));
    }
)
const v6 = memoize(
    function v6(t) {
        return new Vector3(vx6(t), 0, vy6(t));
    }
)
const v7 = memoize(
    function v7(t) {
        return new Vector3(vx7(t), 0, vy7(t));
    }
)
const v8 = memoize(
    function v8(t) {
        return new Vector3(t, 0, vy8(t));
    }
)

const boundsOfFunctions = [
    { tRange: tRanges[0], pathFunction: v1 },
    { tRange: tRanges[1], pathFunction: v2 },
    { tRange: tRanges[2], pathFunction: v3 },
    { tRange: tRanges[3], pathFunction: v4 },
    { tRange: tRanges[4], pathFunction: v5 },
    { tRange: tRanges[5], pathFunction: v6 },
    { tRange: tRanges[6], pathFunction: v7 },
    { tRange: tRanges[7], pathFunction: v8 }
]

console.log(boundsOfFunctions)

const xyPathFunction = memoize(
    function pathFunction(t) {
        for (const { tRange, pathFunction } of boundsOfFunctions) {
            if ((t <= tRange.begin) && (tRange.length > t - tRange.begin)) {
                const result = pathFunction(t - tRange.subtract);

                if (result == undefined) {
                    console.log(`Undefined value on ${pathFunction.name}`)
                }

                return result;
            }
        }
    }
)

const debug = memoize(
    function debug(t) {
        return xyPathFunction(t) || new Vector3(0, 0, 0);
    }
)

export default debug;