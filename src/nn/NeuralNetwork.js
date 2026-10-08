/**
 * A feed-forward neural network trained with backpropagation and plain
 * stochastic gradient descent (one sample per update).
 */
class NeuralNetwork {
    /**
     * @param {DenseLayer[]} layers
     * @param {number} learningRate step size of gradient descent
     */
    constructor(layers, learningRate = 0.001) {
        this.layers = layers;
        this.learningRate = learningRate;
    }

    /**
     * Builds a network with ReLU hidden layers and a linear output layer
     * (Q-values can be any real number, so the output is not squashed).
     *
     * @param {number[]} sizes neurons per layer, input first, e.g. [11, 256, 3]
     * @param {number} learningRate
     * @returns {NeuralNetwork}
     */
    static create(sizes, learningRate = 0.001) {
        const layers = [];
        for (let i = 1; i < sizes.length; i++) {
            const isOutput = i === sizes.length - 1;
            layers.push(DenseLayer.create(sizes[i - 1], sizes[i], isOutput ? Activation.IDENTITY : Activation.RELU));
        }
        return new NeuralNetwork(layers, learningRate);
    }

    get inputSize() {
        return this.layers[0].inputSize;
    }

    get outputSize() {
        return this.layers[this.layers.length - 1].outputSize;
    }

    /**
     * Forward pass.
     * @param {number[]} input
     * @returns {number[]} the network output
     */
    predict(input) {
        if (input.length !== this.inputSize) {
            throw new Error(`Expected ${this.inputSize} inputs but got ${input.length}`);
        }
        return this.#forward(Matrix.fromArray(input)).toArray();
    }

    /**
     * Performs one learning step: forward pass, backpropagation, weight update.
     *
     * The loss is L = 1/2 * sum((output - target)^2), whose derivative with
     * respect to the output is simply (output - target).
     *
     * @param {number[]} input
     * @param {number[]} target the output we would like to get
     * @returns {number} mean squared error before the update
     */
    train(input, target) {
        if (target.length !== this.outputSize) {
            throw new Error(`Expected ${this.outputSize} targets but got ${target.length}`);
        }
        const output = this.#forward(Matrix.fromArray(input));
        const error = output.subtract(Matrix.fromArray(target));

        // Backward pass: the gradient flows from the output layer to the first one
        let gradient = error;
        for (let i = this.layers.length - 1; i >= 0; i--) {
            gradient = this.layers[i].backward(gradient);
        }

        // Update only after every gradient was computed with the OLD weights
        this.layers.forEach(layer => layer.applyGradients(this.learningRate));

        return error.toArray().reduce((sum, e) => sum + e * e, 0) / error.rows;
    }

    #forward(inputMatrix) {
        return this.layers.reduce((activations, layer) => layer.forward(activations), inputMatrix);
    }

    toJSON() {
        return {learningRate: this.learningRate, layers: this.layers.map(layer => layer.toJSON())};
    }

    static fromJSON({learningRate, layers}) {
        return new NeuralNetwork(layers.map(DenseLayer.fromJSON), learningRate);
    }
}
