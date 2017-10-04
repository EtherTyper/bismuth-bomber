import { Scene, Engine, Vector3, Color4, FreeCamera, HemisphericLight, Mesh } from 'babylonjs';
import 'mousetrap';
import './index.css';

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
const statsView = document.querySelector("#stats") as HTMLDivElement;
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
        this.thirdPersonCamera.attachControl(canvas, false);

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
        const nextValue = this.piecewiseFunction(this.tValue + Math.PI / 100); // r(t + ∆x) ≈ r(t + dt)
        const scaledDerivative = nextValue.subtract(currentValue); // ∆r ≈ (dr/dt) * ∆t
        const unitTangent = scaledDerivative.scale(1 / scaledDerivative.length());
        // ∆r / ||∆r|| ≈ (r') * ∆t / (||r'|| * ∆t) = r' / ||r'|| = T(t)

        statsView.innerHTML = `
            Current Position (r(t)): ${currentValue} <br>
            Next Position (r(t + ∆x) ≈ r(t + dt)): ${nextValue} <br>
            Scaled Derivative (∆r ≈ (dr/dt) * ∆t): ${nextValue} <br>
            Unit Tangent Vector (∆r / ||∆r|| ≈ (r') * ∆t / (||r'|| * ∆t) = r' / ||r'|| = T(t)): <br>
            ${unitTangent}
        `

        if (this.tValue % Math.PI <= 0.04) console.log(currentValue, nextValue, unitTangent);

        this.sphere.position = currentValue;
        this.firstPersonCamera.position = currentValue.subtract(unitTangent.scale(5)).add(new Vector3(0, 3, 0));
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
        return new Vector3(-Math.cos(t) - 1, 1, Math.sin(t))
    }
})();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(game.scene.render.bind(game.scene));

// Watch for browser/canvas resize events
window.addEventListener("resize", engine.resize.bind(engine));