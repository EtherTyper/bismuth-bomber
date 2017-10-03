import { Scene, Engine } from 'babylonjs';
import './index.css';

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const scene = (() => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 1, 0);

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
    
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .5;

    const sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    sphere.position.y = 1;
    
    const ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

    return scene;
})();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(scene.render.bind(scene));

// Watch for browser/canvas resize events
window.addEventListener("resize", engine.resize.bind(engine));