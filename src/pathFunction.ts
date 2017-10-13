import { Vector3 } from 'babylonjs';
import { FunctionBounds } from './calculationHelper';
import CalculationHelper from './calculationHelper';

export const bounds = {
    begin: -2,
    increment: 1 / 100,
    final: 2
}

export default function pathFunction(t) {
    function xSquared(t) {
        return new Vector3(1, t, 1);
    }

    return CalculationHelper.integrateVVF(xSquared, {
        begin: 0,
        final: t,
        increment: 1 / 100
    })
}