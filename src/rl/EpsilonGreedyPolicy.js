/**
 * Exploration strategy: explores randomly with a probability that decays as
 * more games are played, otherwise exploits the best known action.
 */
class EpsilonGreedyPolicy {
    /**
     * @param {Object} options
     * @param {number} options.initialEpsilon exploration threshold at game 0
     * @param {number} options.scale random draws are in [0, scale)
     * @param {function(): number} options.random source of numbers in [0, 1)
     */
    constructor({initialEpsilon = 100, scale = 200, random = Math.random} = {}) {
        this.initialEpsilon = initialEpsilon;
        this.scale = scale;
        this.random = random;
    }

    /**
     * @param {number} gamesPlayed
     * @returns {number}
     */
    epsilon(gamesPlayed) {
        return this.initialEpsilon - gamesPlayed;
    }

    /**
     * @param {number[]} state
     * @param {NeuralNetwork} network
     * @param {number} gamesPlayed
     * @returns {number} one of {@link Action}
     */
    selectAction(state, network, gamesPlayed) {
        if (this.random() * this.scale < this.epsilon(gamesPlayed)) {
            return Math.floor(this.random() * Action.COUNT);
        }
        return EpsilonGreedyPolicy.argMax(network.predict(state));
    }

    /**
     * @param {number[]} values
     * @returns {number} index of the largest value
     */
    static argMax(values) {
        return values.indexOf(Math.max(...values));
    }
}
