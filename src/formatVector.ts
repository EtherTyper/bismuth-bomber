import { Vector3, Color4 } from 'babylonjs';

export default function vectorToString(vector: Vector3, brackets = { left: '<', right: '>' }) {
    const x = vector.x.toFixed(3).padStart(6);
    const y = vector.y.toFixed(3).padStart(6);
    const z = vector.z.toFixed(3).padStart(6);
    return `${brackets.left}${x}, ${y}, ${z}${brackets.right}`;
}
