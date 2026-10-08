/**
 * Q-value function approximator backed by a TensorFlow.js model.
 * Hides every tensor operation behind plain-array methods.
 */
class QNetwork {
    /**
     * @param {tf.LayersModel} model
     * @param {tf.Optimizer} optimizer
     */
    constructor(model, optimizer) {
        this.model = model;
        this.optimizer = optimizer;
    }

    /**
     * @param {Object} options
     * @param {number} options.inputSize
     * @param {number} options.outputSize
     * @param {number[]} options.hiddenUnits
     * @param {number} options.learningRate
     * @returns {QNetwork}
     */
    static create({inputSize, outputSize, hiddenUnits = [256, 256], learningRate = 0.001}) {
        const model = tf.sequential();
        hiddenUnits.forEach((units, i) => {
            model.add(tf.layers.dense({
                units,
                activation: 'relu',
                ...(i === 0 ? {inputShape: [inputSize]} : {})
            }));
        });
        model.add(tf.layers.dense({units: outputSize, activation: 'linear'}));
        return new QNetwork(model, tf.train.adam(learningRate));
    }

    /**
     * @param {number[]} state
     * @returns {number[]} Q-value of every action
     */
    predict(state) {
        return this.predictBatch([state])[0];
    }

    /**
     * @param {number[][]} states
     * @returns {number[][]} Q-values of every action, for every state
     */
    predictBatch(states) {
        return tf.tidy(() => this.model.predict(tf.tensor2d(states)).arraySync());
    }

    /**
     * Performs one gradient step towards the targets.
     * @param {number[][]} states
     * @param {number[][]} targets desired Q-values, one row per state
     * @returns {number} the loss before the update
     */
    fit(states, targets) {
        return tf.tidy(() => {
            const statesTensor = tf.tensor2d(states);
            const targetsTensor = tf.tensor2d(targets);
            const cost = this.optimizer.minimize(
                () => tf.losses.meanSquaredError(targetsTensor, this.model.predict(statesTensor)),
                true
            );
            return cost.dataSync()[0];
        });
    }

    /**
     * @param {string} key localStorage key
     * @returns {Promise<void>}
     */
    async save(key) {
        await this.model.save('localstorage://' + key);
    }

    /**
     * Replaces the weights by the ones stored under `key`, if any.
     * @param {string} key localStorage key
     * @returns {Promise<boolean>} true if a saved model was loaded
     */
    async load(key) {
        const url = 'localstorage://' + key;
        const saved = await tf.io.listModels();
        if (!(url in saved)) {
            return false;
        }
        this.model = await tf.loadLayersModel(url);
        return true;
    }
}
