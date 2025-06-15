ml5.setBackend("webgl");
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });

nn.addData([18,9.2,8.1,2], {label:"cat"})
nn.addData([20.1,17,15.5,5], {label:"dog"})


nn.normalizeData()
nn.train({ epochs: 10 }, () => finishedTraining())
async function finishedTraining(){
    const results = await nn.classify([29,11,10,3])
    console.log(results)
}