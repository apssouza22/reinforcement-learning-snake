
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
            let Q_new = sample.reward
            if (!sample.done) {
                // Bellman equation
                Q_new = sample.reward + this.gamma * Math.max(...this.model.predict(sample.nextState))
            }
            let target = [...pred]
            target[argMax(sample.action)] = Q_new
            // for (const action in sample.action) {
            //     if (sample.action[action] > 0) {
            //         target[action] = Q_new
            //     }
            // }
            // target[argMax(sample.action)] = Q_new
            this.model.feedForward(sample.state, true);
            this.model.calculateLoss(target)
            this.model.updateWeights()
            let loss = mse(pred, target)
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
    return error / a.length
}