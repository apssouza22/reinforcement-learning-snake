class QTrainer {
    totalLoss = 0
    totalTrain = 0

    constructor(model, lr, gamma) {
        this.model = model
        this.lr = lr
        this.gamma = gamma
        this.optimizer = tf.train.adam(this.lr);
    }

    /**
     * Trains on a whole batch of samples with a single gradient step.
     * @param {Array} samples
     * @param long
     */
    train(samples, long = false) {
        if (!samples.length) return;

        const loss = tf.tidy(() => {
            const net = this.model.model;
            const states = tf.tensor2d(samples.map(s => s.state));
            const nextStates = tf.tensor2d(samples.map(s => s.nextState));

            const preds = net.predict(states).arraySync();
            const nextPreds = net.predict(nextStates).arraySync();

            // Bellman target: Q_new = r + gamma * max(Q(next)) (only the taken action changes)
            const targets = samples.map((sample, i) => {
                let qNew = sample.reward;
                if (!sample.done) {
                    qNew += this.gamma * Math.max(...nextPreds[i]);
                }
                const target = [...preds[i]];
                target[argMax(sample.action)] = qNew;
                return target;
            });
            const targetTensor = tf.tensor2d(targets);

            const cost = this.optimizer.minimize(
                () => tf.losses.meanSquaredError(targetTensor, net.predict(states)),
                true
            );
            return cost.dataSync()[0];
        });

        if (isFinite(loss)) {
            this.totalLoss += loss * samples.length;
        }
        this.totalTrain += samples.length;

        if (long) {
            console.log(`Mean loss: ${this.totalLoss / this.totalTrain}`);
        }
    }
}
