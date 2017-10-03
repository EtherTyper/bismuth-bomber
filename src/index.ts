import { Scene, Engine, Vector3, Color4, FreeCamera, HemisphericLight, Mesh } from 'babylonjs';
import './index.css';

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const game = new (class MyScene {
    scene: Scene;
    private camera: FreeCamera;
    private light: HemisphericLight;
    private sphere: Mesh;
    private ground: Mesh;
    private tValue: number;

    constructor() {
        this.scene = new Scene(engine);
        this.scene.clearColor = new Color4(0, 1, 0);

        this.camera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);
        this.camera.lockedTarget = Vector3.Zero();
        this.camera.attachControl(canvas, false);

        this.light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        this.light.intensity = .5;

        this.sphere = Mesh.CreateSphere("sphere1", 16, 2, this.scene);
        this.sphere.position.y = 1;
        
        this.ground = Mesh.CreateGround("ground1", 6, 6, 2, this.scene);

        this.tValue = 0

        setInterval(this.updatePosition.bind(this), 25)
    }

    updatePosition() {
        this.tValue += Math.PI / 100;
        this.tValue = this.tValue % (4 * Math.PI);

        console.log(this.tValue);

        if (this.tValue <= Math.PI || this.tValue >= 3 * Math.PI) {
            // this.camera.cameraDirection = new Vector3(Math.cos(this.tValue), 0, Math.sin(this.tValue)).subtract(this.camera.cameraDirection);
            this.sphere.position = this.firstCircle(this.tValue);
        } else {
            this.sphere.position = this.secondCircle(this.tValue);
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