class QTrainer {
    totalLoss = 0
    totalTrain = 0

    constructor(model, lr, gamma) {
        this.model = model
        this.lr = lr
        this.gamma = gamma
        // Setup optimizer for TensorFlow
        this.optimizer = tf.train.adam(this.lr);
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
            
            // Use tf.tidy to automatically dispose tensors
            tf.tidy(() => {
                // Create tensor from state
                const stateTensor = tf.tensor2d([sample.state]);
                
                // Get prediction
                const pred = this.model.model.predict(stateTensor);
                const predArray = pred.dataSync();
                
                // Calculate Q_new (target Q value)
                let Q_new = sample.reward;
                
                if (!sample.done) {
                    // Use Bellman equation for Q-learning
                    const nextStateTensor = tf.tensor2d([sample.nextState]);
                    const nextPred = this.model.model.predict(nextStateTensor);
                    const nextPredArray = nextPred.dataSync();
                    const predArgMax = Math.max(...nextPredArray);
                    
                    if(isNaN(predArgMax)){
                        console.log('Prediction', predArgMax)
                    }
                    
                    Q_new = sample.reward + this.gamma * predArgMax;
                }
                
                // Create target array
                let target = [...predArray];
                const actionIdx = argMax(sample.action);
                target[actionIdx] = Q_new;
                
                // Create target tensor
                const targetTensor = tf.tensor2d([target]);
                
                // Train the model
                this.optimizer.minimize(() => {
                    const predictions = this.model.model.predict(stateTensor);
                    const loss = tf.losses.meanSquaredError(targetTensor, predictions);
                    
                    // Add loss to total
                    const lossValue = loss.dataSync()[0];
                    if (isFinite(lossValue)) {
                        this.totalLoss += lossValue;
                    } else {
                        this.totalLoss += Number.MAX_VALUE;
                    }
                    
                    return loss;
                });
            });
        }
        
        if (long) {
            let meanLoss = this.totalLoss / this.totalTrain;
            console.log(`Mean loss: ${meanLoss}`);
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