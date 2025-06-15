import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18";
import SnakeGame from "./game/index.js";

ml5.setBackend("webgl");
const nn = ml5.neuralNetwork({ task: 'classification', debug: true })
const modelDetails = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin'
}
nn.load(modelDetails, () => console.log("het model is geladen!"))

const enableWebcamButton = document.getElementById("webcamButton")

const video = document.getElementById("webcam")
const gameCanvas = document.getElementById("game")

const game = new SnakeGame({
    canvas: gameCanvas,
    msBetweenFrames: 300,
    gridSize: 21,
    snakeLength: 3,
    predictFunction: predictWebcam
});

let handLandmarker = undefined;
let webcamRunning = false;
let results = undefined;


/********************************************************************
 // CREATE THE POSE DETECTOR
 ********************************************************************/
const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
    });
    console.log("model loaded, you can start webcam")

    enableWebcamButton.addEventListener("click", (e) => enableCam(e))
}

/********************************************************************
 // START THE WEBCAM
 ********************************************************************/
async function enableCam() {
    if (webcamRunning) return;
    webcamRunning = true;
    try {
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.addEventListener("loadeddata", () => {
            predictWebcam();
            game.start();
        });
    } catch (error) {
        console.error("Error accessing webcam:", error);
    }
}

/********************************************************************
 // START PREDICTIONS
 ********************************************************************/
async function predictWebcam() {

    results = await handLandmarker.detectForVideo(video, performance.now())
    if (!results.landmarks[0]) return null;
    const pose = results.landmarks[0].map((landmark) => [landmark.x, landmark.y, landmark.z]).flat();
    return (await nn.classify(pose))[0].label;
}

/********************************************************************
 // START THE APP
 ********************************************************************/
if (navigator.mediaDevices?.getUserMedia) {
    createHandLandmarker()
}