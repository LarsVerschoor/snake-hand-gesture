ml5.setBackend("webgl");
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });

const trainButton = document.getElementById('train');
const input = document.getElementById('data');

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

async function finishedTraining(){
    nn.save("model", () => console.log("model was saved!"));
    const blob = new Blob([JSON.stringify(testingData)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'testing-data.json';
    a.click();
    URL.revokeObjectURL(url);
}