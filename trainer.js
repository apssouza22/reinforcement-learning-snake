
class QTrainer {
    totalLoss = 0
    totalTrain = 0

    constructor(model, lr, gamma) {
        this.model = model
        this.lr = lr
        this.gamma = gamma
    }

    /**
     * @param {Array} samples
     * @param long
     */
    train(samples, long = false) {
        if (long) {
            console.log('Training long memory')
        }
        for (const sample of samples) {
            this.totalTrain++
            const pred = this.model.predict(sample.state)
            if (isNaN(Math.max(...pred))) {
                console.log('Prediction', pred)
            }
            let Q_new = sample.reward
            if (!sample.done) {
                // Bellman equation
                let predArgMax = Math.max(...this.model.predict(sample.nextState));
                if(isNaN(predArgMax)){
                    console.log('Prediction', predArgMax)
                }
                Q_new = sample.reward + this.gamma * predArgMax
            }
            let target = [...pred]
            target[argMax(sample.action)] = Q_new
            this.model.feedForward(sample.state, true);
            this.model.calculateLoss(target)
            this.model.updateWeights()
            let loss = mse(pred, target)
            if (loss === Infinity || loss === -Infinity) {
                loss = Number.MAX_VALUE;
            }
            this.totalLoss += loss
        }
        if (long) {
            let meanLoss = this.totalLoss / this.totalTrain
            console.log(`Mean loss: ${meanLoss}`)
        }
    }
}

function mse(a, b) {
    let error = 0
    for (let i = 0; i < a.length; i++) {
        error += Math.pow((b[i] - a[i]), 2)
    }
    if (isNaN(error)) {
        console.log('Error', error)
    }
    return error / a.length
}