/**
 * Q-learning: turns experiences into Bellman targets and asks the network to
 * move towards them.
 */
class QTrainer {
    #totalLoss = 0;
    #trainedSamples = 0;

    /**
     * @param {NeuralNetwork} network
     * @param {number} gamma discount rate
     */
    constructor(network, gamma) {
        this.network = network;
        this.gamma = gamma;
    }

    get meanLoss() {
        return this.#trainedSamples ? this.#totalLoss / this.#trainedSamples : 0;
    }

    /**
     * Performs one gradient step per experience.
     * @param {Experience[]} experiences
     */
    train(experiences) {
        for (const experience of experiences) {
            const qValues = this.network.predict(experience.state);

            // Only the output of the action taken is moved towards the Bellman target;
            // the other outputs keep their current value, so they produce no error.
            const target = [...qValues];
            target[experience.action] = this.#bellmanTarget(experience);

            const loss = this.network.train(experience.state, target);
            if (isFinite(loss)) {
                this.#totalLoss += loss;
            }
            this.#trainedSamples++;
        }
    }

    /**
     * Q_new = r + gamma * max(Q(next state))
     */
    #bellmanTarget(experience) {
        if (experience.done) {
            return experience.reward;
        }
        const nextQValues = this.network.predict(experience.nextState);
        return experience.reward + this.gamma * Math.max(...nextQValues);
    }
}
