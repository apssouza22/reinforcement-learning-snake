/**
 * Runs the agent-environment loop: observe, act, learn, render.
 */
class TrainingSession {
    /**
     * @param {Object} deps
     * @param {SnakeGame} deps.game
     * @param {Agent} deps.agent
     * @param {StateEncoder} deps.encoder
     * @param {CanvasRenderer} deps.renderer
     * @param {TrainingStats} deps.stats
     * @param {string} deps.modelKey localStorage key where the model is saved
     * @param {number} deps.saveEvery save the model every N games
     * @param {number} deps.maxFramesPerLength a game is aborted after
     *        `maxFramesPerLength * snake length` steps (avoids endless loops)
     */
    constructor({
        game, agent, encoder, renderer, stats = new TrainingStats(),
        modelKey = 'brain', saveEvery = 100, maxFramesPerLength = 100
    }) {
        this.game = game;
        this.agent = agent;
        this.encoder = encoder;
        this.renderer = renderer;
        this.stats = stats;
        this.modelKey = modelKey;
        this.saveEvery = saveEvery;
        this.maxFramesPerLength = maxFramesPerLength;
        this.framesInGame = 0;
        this.timer = null;
    }

    /**
     * @param {number} intervalMs delay between two steps
     */
    start(intervalMs = 60) {
        this.stop();
        this.timer = setInterval(() => this.step(), intervalMs);
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }

    /**
     * Plays one step of the current game and learns from it.
     */
    step() {
        const {game, agent, encoder} = this;

        const state = encoder.encode(game);
        const action = agent.act(state);
        let {reward, done, score} = game.step(action);
        this.framesInGame++;

        if (!done && this.framesInGame > this.maxFramesPerLength * game.snake.length) {
            done = true;
            reward = SnakeGame.DEATH_REWARD;
        }

        agent.observe(new Experience(state, action, reward, encoder.encode(game), done));
        this.renderer.render(game);

        if (done) {
            this.#endGame(score);
        }
    }

    #endGame(score) {
        const {game, agent, stats} = this;

        game.reset();
        this.framesInGame = 0;
        agent.endEpisode();
        stats.recordGame(score);

        console.log(`Game ${stats.games} Score ${score} Record ${stats.record} ` +
            `Mean score ${stats.meanScore.toFixed(2)} Mean loss ${agent.trainer.meanLoss.toFixed(4)}`);

        if (stats.games % this.saveEvery === 0) {
            agent.network.save(this.modelKey).catch(error => console.error('Error saving model:', error));
        }
    }
}
