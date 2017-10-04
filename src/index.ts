import { Scene, Engine, Vector3, Color4, FreeCamera, HemisphericLight, Mesh } from 'babylonjs';
import 'mousetrap';
import './index.css';

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
const statsTable = document.querySelector('#stats') as HTMLDivElement;
const currentValueElement = document.querySelector('#currentValue') as HTMLTableDataCellElement;
const nextValueElement = document.querySelector('#nextValue') as HTMLTableDataCellElement;
const scaledDerivativeElement = document.querySelector('#scaledDerivative') as HTMLTableDataCellElement;
const unitTangentElement = document.querySelector('#unitTangent') as HTMLTableDataCellElement;
const nextScaledDerivativeElement = document.querySelector('#nextScaledDerivative') as HTMLTableDataCellElement;
const scaledSecondDerivativeElement = document.querySelector('#scaledSecondDerivative') as HTMLTableDataCellElement;
const curvatureElement = document.querySelector('#curvature') as HTMLTableDataCellElement;

statsTable.hidden = true;
Mousetrap.bind('f 3', () => { statsTable.hidden = !statsTable.hidden; });

const engine = new Engine(canvas, true);

const game = new (class MyScene {
    scene: Scene;
    private thirdPersonCamera: FreeCamera;
    private firstPersonCamera: FreeCamera;
    private light: HemisphericLight;
    private sphere: Mesh;
    private ground: Mesh;
    private tValue = 0;
    private paused = false;

    constructor() {
        this.scene = new Scene(engine);
        this.scene.clearColor = new Color4(0, 1, 0);

        this.thirdPersonCamera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);
        this.firstPersonCamera = new FreeCamera("camera2", new Vector3(0, 0, 0), this.scene);

        this.scene.activeCamera = this.thirdPersonCamera;

        this.light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        this.light.intensity = .5;

        this.sphere = Mesh.CreateSphere("sphere1", 16, 2, this.scene);
        this.thirdPersonCamera.lockedTarget = this.sphere;
        this.firstPersonCamera.lockedTarget = this.sphere;
        this.sphere.position.y = 1;
        
        this.ground = Mesh.CreateGround("ground1", 6, 6, 2, this.scene);

        Mousetrap.bind('s', () => {
            if (this.scene.activeCamera === this.firstPersonCamera)
                this.scene.activeCamera = this.thirdPersonCamera;
            else if (this.scene.activeCamera === this.thirdPersonCamera)
                this.scene.activeCamera = this.firstPersonCamera;
        });
        Mousetrap.bind('space', () => { this.paused = !this.paused; });

        setInterval(() => {
            if (!this.paused) {
                this.updatePosition()
            }
        }, 25)
    }

    updatePosition() {
        this.tValue += Math.PI / 100;
        this.tValue = this.tValue % (4 * Math.PI);

        const currentValue = this.piecewiseFunction(this.tValue); // r(t)
        const nextValue = this.piecewiseFunction(this.tValue + Math.PI / 100); // r(t + ∆t) ≈ r(t + dt)
        const scaledDerivative = this.scaledDerivative(this.tValue); // r ≈ (dr/dt) * ∆t
        const unitTangent = scaledDerivative.scale(1 / scaledDerivative.length()); // r' * ∆t / (||r'|| * ∆t) = r' / ||r'|| = T(t)
        const nextScaledDerivative = this.scaledDerivative(this.tValue + Math.PI / 100); // r'(t + ∆t) ≈ r'(t + dt)
        const scaledSecondDerivative = nextScaledDerivative.subtract(scaledDerivative); // ∆r' ≈ (r * ∆t) * ∆t = r * ∆t^2
        const curvature = Vector3.Cross(scaledDerivative, scaledSecondDerivative).length() / scaledDerivative.length()**3;
        // ||(r' * ∆t) X (r'' * ∆t^2)|| / (||r'||^3 * ∆t^3) = ||r' X r''|| / ||r'||^3 = K(t)

        currentValueElement.innerText = String(currentValue);
        nextValueElement.innerText = String(nextValue);
        scaledDerivativeElement.innerText = String(scaledDerivative);
        unitTangentElement.innerText = String(unitTangent);
        nextScaledDerivativeElement.innerText = String(nextScaledDerivative);
        scaledSecondDerivativeElement.innerText = String(scaledSecondDerivative);
        curvatureElement.innerHTML = String(curvature);

        if (this.tValue % Math.PI <= 0.04) console.log(currentValue, nextValue, unitTangent);

        this.sphere.position = currentValue;
        this.firstPersonCamera.position = currentValue.subtract(unitTangent.scale(5)).add(new Vector3(0, 3, 0));
    }

    scaledDerivative(t) {
        const currentValue = this.piecewiseFunction(t); // r(t)
        const nextValue = this.piecewiseFunction(t + Math.PI / 100); // r(t + ∆t) ≈ r(t + dt)
        const scaledDerivative = nextValue.subtract(currentValue); // ∆r ≈ r' * ∆t

        return scaledDerivative;
    }

    piecewiseFunction(t) {
        if (t <= Math.PI || t >= 3 * Math.PI) {
            return this.firstCircle(t);
        } else {
            return this.secondCircle(t);
        }
    }

    firstCircle(t) {
        return new Vector3(Math.cos(t) + 1, 1, Math.sin(t))
    }

    secondCircle(t) {
        return new Vector3(-2 * Math.cos(t) - 2, 1, 2 * Math.sin(t))
    }
})();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(game.scene.render.bind(game.scene));

// Watch for browser/canvas resize events
window.addEventListener("resize", engine.resize.bind(engine));