import { Vector3 } from 'babylonjs';
import { range, memoize } from 'lodash';

export type FunctionBounds = {
    begin: number,
    increment: number,
    final: number
};

export default class CalculationHelper {
    pathFunction: (t: number) => Vector3;
    bounds: FunctionBounds;

    constructor(pathFunction: (t: number) => Vector3, bounds: FunctionBounds) {
        this.pathFunction = memoize(pathFunction);
        this.bounds = bounds;

        this.valueAfter = memoize(this.valueAfter);
        this.scaledDifferential = memoize(this.scaledDifferential);
        this.unitTangent = memoize(this.unitTangent);
        this.cartRotation = memoize(this.cartRotation);
        this.scaledSecondDifferential = memoize(this.scaledSecondDifferential);
        this.curvature = memoize(this.curvature);
        this.cameraPosition = memoize(this.cameraPosition);
        this.derivativeMagnitude = memoize(this.derivativeMagnitude);
        CalculationHelper.integrateFunction = memoize(CalculationHelper.integrateFunction);
        CalculationHelper.integrateVVF = memoize(CalculationHelper.integrateVVF);
        this.arcLength = memoize(this.arcLength);
    }

    valueAfter(t: number) {
        return (t + this.bounds.increment - this.bounds.begin) % (this.bounds.final - this.bounds.begin) + this.bounds.begin;
    }

    scaledDifferential(t: number) {
        const currentValue = this.pathFunction(t); // r(t)
        const nextValue = this.pathFunction(this.valueAfter(t)); // r(t + ∆t) ≈ r(t + dt)
        return nextValue.subtract(currentValue); // ∆r ≈ r' * ∆t = dr
    }

    unitTangent(t: number) {
        const scaledDifferential = this.scaledDifferential(t);
        return scaledDifferential.scale(1 / scaledDifferential.length()); // r' * ∆t / (||r'|| * ∆t) = r' / ||r'|| = T(t)
    }

    cartRotation(t: number) {
        const unitTangent = this.unitTangent(t);
        return new Vector3(0, -Math.atan2(unitTangent.z, unitTangent.x), -Math.acos(unitTangent.y));
    }

    scaledSecondDifferential(t: number) {
        const scaledDifferential = this.scaledDifferential(t); // ∆r ≈ r' * ∆t = dr
        const nextDifferential = this.scaledDifferential(this.valueAfter(t)); // r'(t + ∆t) * ∆t ≈ dr(t + dt)
        return nextDifferential.subtract(scaledDifferential); // ∆dr ≈ (r' * ∆t)' * ∆t = r'' * ∆t^2 = (d^2)r
    }

    curvature(t: number) {
        const scaledDifferential = this.scaledDifferential(t);
        const secondDifferential = this.scaledSecondDifferential(t);
        return Vector3.Cross(scaledDifferential, secondDifferential).length() / scaledDifferential.length() ** 3;
        // ||(r' * ∆t) X (r'' * ∆t^2)|| / (||r'||^3 * ∆t^3) = ||r' X r''|| / ||r'||^3 = K(t)
    }

    cameraPosition(t: number) {
        const currentValue = this.pathFunction(t);
        const unitTangent = this.unitTangent(t);
        return currentValue.subtract(unitTangent.scale(5)); // Look from behind the direction the cart is going.
    }

    static integrateFunction(integrand: (t: number) => number, bounds: FunctionBounds) {
        if (bounds.begin > bounds.final + bounds.increment * 2) {
            return -CalculationHelper.integrateFunction(integrand, {
                ...bounds,
                begin: bounds.final,
                final: bounds.begin
            });
        } else if (bounds.final > bounds.begin + bounds.increment * 2) {
            const prevIntegral = CalculationHelper.integrateFunction(integrand, {
                ...bounds,
                final: bounds.final - bounds.increment
            })
            const nextValue = integrand(bounds.final) * bounds.increment;

            return prevIntegral + nextValue;
        } else {
            return 0;
        }
    }

    static integrateVVF(integrand: (t: number) => Vector3, bounds: FunctionBounds): Vector3 {
        if (bounds.begin > bounds.final + bounds.increment * 2) {
            console.log(new Vector3(1, 1, 1).negate())

            return CalculationHelper.integrateVVF(integrand, {
                ...bounds,
                begin: bounds.final,
                final: bounds.begin
            }).negate();
        } else if (bounds.final > bounds.begin + bounds.increment * 2) {
            const prevIntegral = CalculationHelper.integrateVVF(integrand, {
                ...bounds,
                final: bounds.final - bounds.increment
            })
            const nextValue = integrand(bounds.final).scale(bounds.increment);

            return prevIntegral.add(nextValue);
        } else {
            return new Vector3(0, 0, 0);
        }
    }

    derivativeMagnitude(t: number) {
        return this.scaledDifferential(t).length() / this.bounds.increment;
    }

    arcLength() {
        return CalculationHelper.integrateFunction(this.derivativeMagnitude.bind(this), this.bounds);
    }
}