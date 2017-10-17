import { Vector3 } from 'babylonjs';
import { FunctionBounds } from './calculationHelper';
import CalculationHelper from './calculationHelper';

export const bounds = {
    begin: 0,
    increment: Math.PI / 100,
    final: 13.65 * Math.PI + 1
}

export default function pathFunction(t) {
    if (t <= 6 * Math.PI) {
        return new Vector3(t * Math.sin(t), t * Math.cos(t), t);
        // < (12*pi-t).*cos(t-pi/2) , (12*pi-t).*sin(t-pi/2)+12*pi, t >
    } else if (t <= 12 * Math.PI) {
        return new Vector3((12*Math.PI-t)*Math.cos(t-Math.PI/2) , (12*Math.PI-t)*Math.sin(t-Math.PI/2)+12*Math.PI, t);
    } else if (t <= 13 * Math.PI) {
        return new Vector3(3 * (t-12*Math.PI) ** 2, 3 * (t-12*Math.PI) ** 2+t, (-(t-12*Math.PI)) ** 4+t);
    } else if (t <= 13.65 * Math.PI) {
        return new Vector3(50 * Math.cos(t-13 * Math.PI)+(t-13*Math.PI)*6*Math.PI+3*Math.PI**2-50,
            (-(t-13*Math.PI)) ** 6+(t-13*Math.PI) * (1+6*Math.PI)+3*(Math.PI) ** 2+Math.PI, 
            (t-13*Math.PI) ** 8+(t-13*Math.PI) * (1-4*Math.PI**3)+13 * Math.PI-Math.PI**4);
    } else {
        return new Vector3((-25.7008-2*4.59925)*(t-13.65*Math.PI)**3+(3*4.59925+2*25.7008)*(t-13.65*Math.PI)**2-25.7008**(t-13.65*Math.PI)-4.59925,
            (1-193.194+2*38.4761)*(t-13.65*Math.PI)**3+(-3*38.4761+2*193.194-1)*(t-13.65*Math.PI)**2-193.194*(t-13.65*Math.PI)+38.4761,
            (1+1061.47-2*5.44287)*(t-13.65*Math.PI)**3+(3*5.44287-2*1061.47-1)*(t-13.65*Math.PI)**2+1061.47*(t-13.65*Math.PI)-5.44287)
    }
}