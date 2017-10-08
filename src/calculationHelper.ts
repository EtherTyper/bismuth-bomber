import { Vector3 } from 'babylonjs';
import { memoize } from 'decko';

export type FunctionBounds = {
    begin: number,
    increment: number,
    final: number
};

export default class CalculationHelper {
    pathFunction: (t: number) => Vector3;
    bounds: FunctionBounds;

    constructor(pathFunction: (t: number) => Vector3, bounds: FunctionBounds) {
        this.pathFunction = pathFunction;
        this.bounds = bounds;
    }

    @memoize
    valueAfter(t: number) {
        return (t + this.bounds.increment) % this.bounds.final;
    }

    @memoize
    scaledDifferential(t: number) {
        const currentValue = this.pathFunction(t); // r(t)
        const nextValue = this.pathFunction(this.valueAfter(t)); // r(t + ∆t) ≈ r(t + dt)
        return nextValue.subtract(currentValue); // ∆r ≈ r' * ∆t = dr
    }

    @memoize
    unitTangent(t: number) {
        const scaledDifferential = this.scaledDifferential(t);
        return scaledDifferential.scale(1 / scaledDifferential.length()); // r' * ∆t / (||r'|| * ∆t) = r' / ||r'|| = T(t)
    }

    @memoize
    cartRotation(t: number) {
        const unitTangent = this.unitTangent(t);
        return new Vector3(0, -Math.atan2(unitTangent.z, unitTangent.x), -Math.acos(unitTangent.y));
    }

    @memoize
    scaledSecondDifferential(t: number) {
        const scaledDifferential = this.scaledDifferential(t); // ∆r ≈ r' * ∆t = dr
        const nextDifferential = this.scaledDifferential(this.valueAfter(t)); // r'(t + ∆t) * ∆t ≈ dr(t + dt)
        return nextDifferential.subtract(scaledDifferential); // ∆dr ≈ (r' * ∆t)' * ∆t = r'' * ∆t^2 = d2r/dt2
    }

    @memoize
    curvature(t: number) {
        const scaledDifferential = this.scaledDifferential(t);
        const secondDifferential = this.scaledSecondDifferential(t);
        return Vector3.Cross(scaledDifferential, secondDifferential).length() / scaledDifferential.length() ** 3;
        // ||(r' * ∆t) X (r'' * ∆t^2)|| / (||r'||^3 * ∆t^3) = ||r' X r''|| / ||r'||^3 = K(t)
    }

    @memoize
    cameraPosition(t: number) {
        const currentValue = this.pathFunction(t);
        const unitTangent = this.unitTangent(t);
        return currentValue.subtract(unitTangent.scale(5)); // Look from behind the direction the cart is going.
    }
}