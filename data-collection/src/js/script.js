import { HandLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

const enableWebcamButton = document.getElementById("webcamButton")

const video = document.getElementById("webcam")
const canvasElement = document.getElementById("output_canvas")
const canvasCtx = canvasElement.getContext("2d")

const logButton = document.getElementById("logButton")
const drawUtils = new DrawingUtils(canvasCtx)
let handLandmarker = undefined;
let webcamRunning = false;
let results = undefined;

const trainButtons = [
    {label: 'up', element: document.getElementById('addUp')},
    {label: 'down', element: document.getElementById('addDown')},
    {label: 'left', element: document.getElementById('addLeft')},
    {label: 'right', element: document.getElementById('addRight')}
]

const clearDataButton = document.getElementById('clearData');
const dataSummaryElement = document.getElementById('dataSummary');
const downloadButton = document.getElementById('download');

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
    logButton.addEventListener("click", (e) => logAllHands(e))
}

/********************************************************************
 // START THE WEBCAM
 ********************************************************************/
async function enableCam() {
    webcamRunning = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
        video.addEventListener("loadeddata", () => {
            canvasElement.style.width = video.videoWidth;
            canvasElement.style.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvasElement.height = video.videoHeight;
            document.querySelector(".videoView").style.height = video.videoHeight + "px";
            predictWebcam();
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

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for(let hand of results.landmarks){
        drawUtils.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 5 });
        drawUtils.drawLandmarks(hand, { radius: 4, color: "#FF0000", lineWidth: 2 });
    }

    if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam)
    }
}

/********************************************************************
 // TRAINING DATA
 ********************************************************************/
trainButtons.forEach((button) => {
    button.element.addEventListener('click', () => {
        if (!results.landmarks[0]) return;
        addTrainingData({label: button.label, points: results.landmarks[0].map((landmark) => [landmark.x, landmark.y, landmark.z]).flat()});
    });
});

function addTrainingData(data) {
    const existingData = localStorage.getItem('training-data');
    const trainingData = existingData ? JSON.parse(existingData) : [];
    trainingData.push(data);
    trainingData.sort(() => Math.random() - 0.5);
    localStorage.setItem('training-data', JSON.stringify(trainingData));
    showDataSummary(trainingData);
}

clearDataButton.addEventListener('click', () => {
    localStorage.removeItem('training-data');
    showDataSummary([])
    console.log('TRAINING DATA CLEARED')
});

function showDataSummary(data) {
    if (data.length === 0) {
        dataSummaryElement.innerText = 'NO DATA';
        return;
    }
    const counts = data.reduce((result, item) => {
        result[item.label] = (result[item.label] || 0) + 1;
        return result;
    }, {});
    let text = '';
    Object.keys(counts).forEach((key) => {
        text += `${key}: ${counts[key]} times\n`;
    });
    dataSummaryElement.innerText = text;
}

downloadButton.addEventListener('click', () => {
    const existingData = localStorage.getItem('training-data');
    const trainingData = existingData ? JSON.parse(existingData) : [];
    if (trainingData.length === 0) return;
    const blob = new Blob([JSON.stringify(trainingData.sort(() => Math.random() - 0.5))], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training-data.json';
    a.click();
    URL.revokeObjectURL(url);
});

/********************************************************************
 // LOG HAND COORDINATES IN THE CONSOLE
 ********************************************************************/
function logAllHands(){
    for (let hand of results.landmarks) {
        console.log(hand)
    }
}

/********************************************************************
 // START THE APP
 ********************************************************************/
if (navigator.mediaDevices?.getUserMedia) {
    createHandLandmarker()
}