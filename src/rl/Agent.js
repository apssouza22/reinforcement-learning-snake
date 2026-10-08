/**
 * Learning agent. Composes the decision policy, the replay memory and the
 * trainer around a Q-network.
 */
class Agent {
    /**
     * @param {Object} deps
     * @param {NeuralNetwork} deps.network
     * @param {QTrainer} deps.trainer
     * @param {ReplayMemory} deps.memory
     * @param {EpsilonGreedyPolicy} deps.policy
     * @param {number} deps.batchSize size of the batch used after each game
     */
    constructor({network, trainer, memory, policy, batchSize = 1000}) {
        this.network = network;
        this.trainer = trainer;
        this.memory = memory;
        this.policy = policy;
        this.batchSize = batchSize;
        this.gamesPlayed = 0;
    }

    /**
     * @param {number[]} state
     * @returns {number} one of {@link Action}
     */
    act(state) {
        return this.policy.selectAction(state, this.network, this.gamesPlayed);
    }

    /**
     * Learns from a transition right away and stores it for later replay.
     * @param {Experience} experience
     */
    observe(experience) {
        this.trainer.train([experience]);
        this.memory.add(experience);
    }

    /**
     * To be called when a game is over: replays past experiences.
     */
    endEpisode() {
        this.gamesPlayed++;
        this.trainer.train(this.memory.sample(this.batchSize));
    }
}
