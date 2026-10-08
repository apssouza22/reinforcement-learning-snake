/**
 * Q-learning: turns experiences into Bellman targets and asks the network to
 * move towards them.
 */
class QTrainer {
    #totalLoss = 0;
    #trainedSamples = 0;

    /**
     * @param {QNetwork} network
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
     * Trains on a whole batch with a single gradient step.
     * @param {Experience[]} experiences
     */
    train(experiences) {
        if (experiences.length === 0) return;

        const states = experiences.map(e => e.state);
        const predictions = this.network.predictBatch(states);
        const nextPredictions = this.network.predictBatch(experiences.map(e => e.nextState));

        const targets = experiences.map((experience, i) => {
            const target = [...predictions[i]];
            target[experience.action] = this.#bellmanTarget(experience, nextPredictions[i]);
            return target;
        });

        const loss = this.network.fit(states, targets);
        if (isFinite(loss)) {
            this.#totalLoss += loss * experiences.length;
        }
        this.#trainedSamples += experiences.length;
    }

    /**
     * Q_new = r + gamma * max(Q(next)); only the action taken is updated.
     */
    #bellmanTarget(experience, nextQValues) {
        if (experience.done) {
            return experience.reward;
        }
        return experience.reward + this.gamma * Math.max(...nextQValues);
    }
}
