ml5.setBackend("webgl");
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });

const trainButton = document.getElementById('train');
const input = document.getElementById('data');
const accuracyButton = document.getElementById('accuracy');
const accuracyResultElement = document.getElementById('accuracyResult');

let trainingData = null;
let testingData = null;

input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const data = JSON.parse(text);

    [trainingData, testingData] = (() => {
        const index = Math.floor(data.length * 0.2);
        return [data.slice(index), data.slice(0, index)];
    })();

    console.log(testingData.length, trainingData.length)
});

trainButton.addEventListener('click', () => {
    if (!trainingData || !testingData) return;

    trainingData.forEach((item) => {
        nn.addData(item.points, {label: item.label});
    });

    nn.normalizeData()

    nn.train({ epochs: 100 }, () => finishedTraining())
});

accuracyButton.addEventListener('click', () => {
    if (!testingData) return;

    let correctCount = 0;
    testingData.forEach(async (item) => {
        const prediction = await nn.classify(item.points);
        if (prediction[0].label === item.label) correctCount++;
        accuracyResultElement.innerText = `Model accuracy is ${correctCount / testingData.length * 100}%`
    })
});

async function finishedTraining(){
    nn.save("model", () => console.log("model was saved!"));
}