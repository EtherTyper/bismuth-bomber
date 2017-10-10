import { Scene, Engine, Vector3, Color4, FreeCamera, HemisphericLight, Mesh } from 'babylonjs';
import { range } from 'lodash';
import formatVector from './formatVector';
import { FunctionBounds } from './calculationHelper';
import CalculationHelper from './calculationHelper';
import 'mousetrap';

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
const statsTable = document.querySelector('#stats') as HTMLDivElement;
const currentValueElement = document.querySelector('#currentValue') as HTMLTableDataCellElement;
const nextValueElement = document.querySelector('#nextValue') as HTMLTableDataCellElement;
const scaledDifferentialElement = document.querySelector('#scaledDifferential') as HTMLTableDataCellElement;
const unitTangentElement = document.querySelector('#unitTangent') as HTMLTableDataCellElement;
const cartRotationElement = document.querySelector('#cartRotation') as HTMLTableDataCellElement;
const nextScaledDifferentialElement = document.querySelector('#nextScaledDifferential') as HTMLTableDataCellElement;
const scaledSecondDifferentialElement = document.querySelector('#scaledSecondDifferential') as HTMLTableDataCellElement;
const curvatureElement = document.querySelector('#curvature') as HTMLTableDataCellElement;
const maxCurvaturePointElement = document.querySelector('#maxCurvaturePoint') as HTMLTableDataCellElement;
const maxCurvatureElement = document.querySelector('#maxCurvature') as HTMLTableDataCellElement;
const arcLengthElement = document.querySelector('#arcLength') as HTMLTableDataCellElement;

export default class Game {
    // Object references and constants.
    scene: Scene;
    private thirdPersonCamera: FreeCamera;
    private firstPersonCamera: FreeCamera;
    private light: HemisphericLight;
    private cart: Mesh;
    private ground: Mesh;
    private cartPath: Mesh;
    private calculationHelper: CalculationHelper;

    // Application State
    private tValue: number;
    private maxCurvature = {
        point: new Vector3(NaN, NaN, NaN),
        curvature: -1
    }
    private arcLength = {
        finished: false,
        currentValue: 0
    };
    private paused = false;

    constructor(engine: Engine, pathFunction: (t: number) => Vector3, bounds: FunctionBounds) {
        this.scene = new Scene(engine);
        this.scene.clearColor = new Color4(0, 0, 1, 0.5);

        this.thirdPersonCamera = new FreeCamera("thirdPerson", new Vector3(0, 5, -10), this.scene);
        this.firstPersonCamera = new FreeCamera("firstPerson", new Vector3(0, 0, 0), this.scene);
        this.scene.activeCamera = this.thirdPersonCamera;

        this.light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        this.light.intensity = .5;

        this.cart = Mesh.CreateBox("cart", 1, this.scene);
        this.thirdPersonCamera.lockedTarget = this.cart;
        this.firstPersonCamera.lockedTarget = this.cart;
        this.cart.position.y = 1;

        this.ground = Mesh.CreateGround("ground", 10, 10, 2, this.scene);

        const pathArray = range(bounds.begin, bounds.final, bounds.increment).map(pathFunction);
        this.cartPath = Mesh.CreateLines("lines", [...pathArray, pathArray[0]], this.scene);

        this.calculationHelper = new CalculationHelper(pathFunction, bounds);
        this.tValue = bounds.begin;

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
        const currentValue = this.calculationHelper.pathFunction(this.tValue);
        const nextValue = this.calculationHelper.pathFunction(this.calculationHelper.valueAfter(this.tValue));
        const scaledDifferential = this.calculationHelper.scaledDifferential(this.tValue);
        const unitTangent = this.calculationHelper.unitTangent(this.tValue);
        const cartRotation = this.calculationHelper.cartRotation(this.tValue);
        const nextScaledDifferential = this.calculationHelper.scaledDifferential(this.calculationHelper.valueAfter(this.tValue));
        const scaledSecondDifferential = this.calculationHelper.scaledSecondDifferential(this.tValue);
        const curvature = this.calculationHelper.curvature(this.tValue);

        if (!this.arcLength.finished) {
            this.arcLength.currentValue += scaledDifferential.length();
            
            if (this.tValue + this.calculationHelper.bounds.increment > this.calculationHelper.bounds.final) {
                this.arcLength.finished = true;
            }
        }
        
        this.tValue = this.calculationHelper.valueAfter(this.tValue);

        if (curvature > this.maxCurvature.curvature) {
            this.maxCurvature = {
                point: currentValue,
                curvature
            }
        }

        const parentheses = { left: '(', right: ')' };
        currentValueElement.innerText = formatVector(currentValue, parentheses);
        nextValueElement.innerText = formatVector(nextValue, parentheses);
        scaledDifferentialElement.innerText = formatVector(scaledDifferential);
        unitTangentElement.innerText = formatVector(unitTangent);
        cartRotationElement.innerText = formatVector(cartRotation);
        nextScaledDifferentialElement.innerText = formatVector(nextScaledDifferential);
        scaledSecondDifferentialElement.innerText = formatVector(scaledSecondDifferential);
        curvatureElement.innerText = curvature.toFixed(3);
        maxCurvaturePointElement.innerText = formatVector(this.maxCurvature.point, parentheses);
        maxCurvatureElement.innerText = this.maxCurvature.curvature.toFixed(3);
        arcLengthElement.innerText = this.arcLength.currentValue.toFixed(3);

        this.cart.position = currentValue;
        this.cart.rotation = cartRotation;

        this.firstPersonCamera.position = this.calculationHelper.cameraPosition(this.tValue);
    }
}