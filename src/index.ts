import { Scene, Engine, Vector3, Color4, FreeCamera, HemisphericLight, Mesh } from 'babylonjs';
import 'mousetrap';
import './index.css';

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
const statsTable = document.querySelector('#stats') as HTMLDivElement;
const currentValueElement = document.querySelector('#currentValue') as HTMLTableDataCellElement;
const nextValueElement = document.querySelector('#nextValue') as HTMLTableDataCellElement;
const scaledDerivativeElement = document.querySelector('#scaledDerivative') as HTMLTableDataCellElement;
const unitTangentElement = document.querySelector('#unitTangent') as HTMLTableDataCellElement;
const cartRotationElement = document.querySelector('#cartRotation') as HTMLTableDataCellElement;
const nextScaledDerivativeElement = document.querySelector('#nextScaledDerivative') as HTMLTableDataCellElement;
const scaledSecondDerivativeElement = document.querySelector('#scaledSecondDerivative') as HTMLTableDataCellElement;
const curvatureElement = document.querySelector('#curvature') as HTMLTableDataCellElement;

statsTable.hidden = true;
Mousetrap.bind('d', () => { statsTable.hidden = !statsTable.hidden; });

const engine = new Engine(canvas, true);

function vectorToString(vector: Vector3, brackets = { left: '<', right: '>' }) {
    const x = vector.x.toFixed(3).padStart(6);
    const y = vector.y.toFixed(3).padStart(6);
    const z = vector.z.toFixed(3).padStart(6);
    return `${brackets.left}${x}, ${y}, ${z}${brackets.right}`;
}

const game = new (class Game {
    private _scene = new Scene(engine);
    private thirdPersonCamera = new FreeCamera("thirdPerson", new Vector3(0, 5, -10), this._scene);
    private firstPersonCamera = new FreeCamera("firstPerson", new Vector3(0, 0, 0), this._scene);
    private light = new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);
    private cart = Mesh.CreateBox("cart", 1, this._scene);
    private ground = Mesh.CreateGround("ground", 10, 10, 2, this._scene);
    private cartPath: Mesh;
    private bounds = {
        begin: 0,
        increment: Math.PI / 100,
        final: 6 * Math.PI
    };
    private tValue = this.bounds.begin;
    private paused = false;

    constructor() {
        this._scene.clearColor = new Color4(0, 0, 1, 0.5);
        this._scene.activeCamera = this.thirdPersonCamera;

        this.light.intensity = .5;

        this.thirdPersonCamera.lockedTarget = this.cart;
        this.firstPersonCamera.lockedTarget = this.cart;
        this.cart.position.y = 1;

        Mousetrap.bind('s', () => {
            if (this._scene.activeCamera === this.firstPersonCamera)
                this._scene.activeCamera = this.thirdPersonCamera;
            else if (this._scene.activeCamera === this.thirdPersonCamera)
                this._scene.activeCamera = this.firstPersonCamera;
        });
        Mousetrap.bind('space', () => { this.paused = !this.paused; });

        let pathArray: Vector3[] = [];
        for (let t = this.bounds.begin; t < this.bounds.final; t += this.bounds.increment) {
            pathArray.push(Game.piecewiseFunction(t));
        }

        this.cartPath = Mesh.CreateLines("lines", [...pathArray, pathArray[0]], this._scene);

        setInterval(() => {
            if (!this.paused) {
                this.updatePosition()
            }
        }, 25)
    }

    get scene() {
        return this._scene;
    }

    updatePosition() {
        this.tValue += this.bounds.increment;
        this.tValue = this.tValue % this.bounds.final;

        const currentValue = Game.piecewiseFunction(this.tValue); // r(t)
        const nextValue = Game.piecewiseFunction(this.tValue + Math.PI / 100); // r(t + ∆t) ≈ r(t + dt)
        const scaledDerivative = Game.scaledDerivative(this.tValue); // r ≈ (dr/dt) * ∆t
        const unitTangent = scaledDerivative.scale(1 / scaledDerivative.length()); // r' * ∆t / (||r'|| * ∆t) = r' / ||r'|| = T(t)
        const cartRotation = new Vector3(0, -Math.atan2(unitTangent.z, unitTangent.x), -Math.acos(unitTangent.y));
        const nextScaledDerivative = Game.scaledDerivative(this.tValue + Math.PI / 100); // r'(t + ∆t) ≈ r'(t + dt)
        const scaledSecondDerivative = nextScaledDerivative.subtract(scaledDerivative); // ∆r' ≈ (r * ∆t) * ∆t = r * ∆t^2
        const curvature = Vector3.Cross(scaledDerivative, scaledSecondDerivative).length() / scaledDerivative.length()**3;
        // ||(r' * ∆t) X (r'' * ∆t^2)|| / (||r'||^3 * ∆t^3) = ||r' X r''|| / ||r'||^3 = K(t)

        const parentheses = { left: '(', right: ')' };
        currentValueElement.innerText = vectorToString(currentValue, parentheses);
        nextValueElement.innerText = vectorToString(nextValue, parentheses);
        scaledDerivativeElement.innerText = vectorToString(scaledDerivative);
        unitTangentElement.innerText = vectorToString(unitTangent);
        cartRotationElement.innerText = vectorToString(cartRotation);
        nextScaledDerivativeElement.innerText = vectorToString(nextScaledDerivative);
        scaledSecondDerivativeElement.innerText = vectorToString(scaledSecondDerivative);
        curvatureElement.innerHTML = curvature.toFixed(3);

        this.cart.position = currentValue;
        this.cart.rotation = cartRotation;

        this.firstPersonCamera.position = currentValue.subtract(unitTangent.scale(5));
    }

    static scaledDerivative(t) {
        const currentValue = Game.piecewiseFunction(t); // r(t)
        const nextValue = Game.piecewiseFunction(t + Math.PI / 100); // r(t + ∆t) ≈ r(t + dt)
        return nextValue.subtract(currentValue); // ∆r ≈ r' * ∆t
    }

    static piecewiseFunction(t) {
        if (t <= Math.PI || t >= 5 * Math.PI) {
            return Game.firstCircle(t);
        } else {
            return Game.secondCircle(t);
        }
    }

    static firstCircle(t) {
        return new Vector3(Math.cos(t) + 1, 3 + Math.sin(t), Math.sin(t))
    }

    static secondCircle(t) {
        return new Vector3(-2 * Math.cos(t / 2 + Math.PI / 2) - 2, 3 + Math.sin(t), 2 * Math.sin(t / 2 + Math.PI / 2))
    }
})();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(game.scene.render.bind(game.scene));

// Watch for browser/canvas resize events
window.addEventListener("resize", engine.resize.bind(engine));