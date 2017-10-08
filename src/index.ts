import { Engine } from 'babylonjs';
import { bounds } from './pathFunction';
import pathFunction from './pathFunction';
import Visualisation from './visualisation'
import 'mousetrap';
import './index.css';

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
const statsTable = document.querySelector('#stats') as HTMLDivElement;

statsTable.hidden = true;
Mousetrap.bind('d', () => { statsTable.hidden = !statsTable.hidden; });

const engine = new Engine(canvas, true);

const game = new Visualisation(engine, pathFunction, bounds);

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(game.scene.render.bind(game.scene));

// Watch for browser/canvas resize events
window.addEventListener("resize", engine.resize.bind(engine));