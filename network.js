// This file contains TensorFlow.js implementation of the neural network

/**
 * Artificial Neural Network using TensorFlow.js
 */
class NeuralNetwork {
    /**
     * @param {tf.Sequential} model - TensorFlow model
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Perform the feed forward operation
     * @param {number[]} input_array - Array of input values
     * @param {Boolean} GET_ALL_LAYERS - Not used with TensorFlow implementation
     * @returns {number[]} - The Neural net output
     */
    feedForward(input_array, GET_ALL_LAYERS = false) {
        const tensorInput = tf.tensor2d([input_array]);
        const prediction = this.model.predict(tensorInput);
        const result = prediction.dataSync();
        tensorInput.dispose();
        prediction.dispose();
        return Array.from(result);
    }
}

/**
 * Neural Network that implements TensorFlow.js for training
 */
class TrainableNeuralNetwork extends NeuralNetwork {
    learningRate;

    /**
     * Constructor
     * @param {tf.Sequential} model
     * @param {number} learningRate
     */
    constructor(model, learningRate = 0.1) {
        super(model);
        this.learningRate = learningRate;
    }

    /**
     * Perform the prediction
     * @param {number[]} input - Array of input values
     **/
    predict(input) {
        return this.feedForward(input);
    }

    /**
     * Save the model to localStorage
     * @param {String} key - the local storage key to save the model to
     */
    save(key = "brain") {
        const saveResults = this.model.save('localstorage://' + key);
        console.log('Model saved:', saveResults);
    }

    /**
     * Load the model from localStorage
     * @param {String} key - the local storage key to load the model from
     */
    async loadWeights(key = "brain") {
        try {
            const model = await tf.loadLayersModel('localstorage://' + key);
            this.model = model;
            console.log('Model loaded successfully');
            return true;
        } catch (e) {
            console.error('Failed to load model:', e);
            return false;
        }
    }
}

/**
 * Return the index of the highest value in the array
 * (e.g. argMax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
 * @param arr
 * @return {number}
 */
function argMax(arr) {
    return arr.indexOf(Math.max(...arr));
}
