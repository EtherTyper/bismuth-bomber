import { Vector3 } from 'babylonjs';
import { FunctionBounds } from './calculationHelper';
import CalculationHelper from './calculationHelper';

export const bounds = {
    begin: 0,
    increment: Math.PI / 100,
    final: 6 * Math.PI
}

export default function pathFunction(t) {
    function firstCircle(t) {
        return new Vector3(Math.cos(t) + 1, 3 + Math.sin(t), Math.sin(t))
    }

    function secondCircle(t) {
        return new Vector3(-2 * Math.cos(t / 2 + Math.PI / 2) - 2, 3 + Math.sin(t), 2 * Math.sin(t / 2 + Math.PI / 2))
    }

    if (t <= Math.PI || t >= 5 * Math.PI) {
        return firstCircle(t);
    } else {
        return secondCircle(t);
    }
}