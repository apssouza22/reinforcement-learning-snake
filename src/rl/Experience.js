/**
 * A single transition observed by the agent.
 */
class Experience {
    /**
     * @param {number[]} state
     * @param {number} action one of {@link Action}
     * @param {number} reward
     * @param {number[]} nextState
     * @param {boolean} done
     */
    constructor(state, action, reward, nextState, done) {
        this.state = state;
        this.action = action;
        this.reward = reward;
        this.nextState = nextState;
        this.done = done;
        Object.freeze(this);
    }
}
