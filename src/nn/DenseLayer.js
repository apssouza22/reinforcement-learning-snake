/**
 * A fully connected layer: every output neuron is connected to every input.
 *
 *   forward:   z = W . x + b      a = f(z)
 *   backward:  given dL/da, compute dL/dW, dL/db and dL/dx (to hand to the previous layer)
 *
 * Shapes: x (in x 1), W (out x in), b (out x 1), a (out x 1)
 */
class DenseLayer {
    /**
     * @param {Matrix} weights (out x in)
     * @param {Matrix} biases (out x 1)
     * @param {Activation} activation
     */
    constructor(weights, biases, activation) {
        this.weights = weights;
        this.biases = biases;
        this.activation = activation;

        // Remembered by forward() so that backward() can use them
        this.input = null;
        this.output = null;

        // Computed by backward(), consumed by applyGradients()
        this.weightGradient = null;
        this.biasGradient = null;
    }

    /**
     * Creates a layer with random weights.
     *
     * Weights are drawn from a normal distribution whose spread shrinks as the
     * number of inputs grows, so the signal keeps a similar size from layer to
     * layer instead of exploding or fading away:
     *  - ReLU kills half of the signal, so it uses sqrt(2 / inputs) ("He" init)
     *  - other activations use sqrt(1 / inputs) ("Xavier/LeCun" init)
     * Biases start at zero.
     *
     * @param {number} inputSize
     * @param {number} outputSize
     * @param {Activation} activation
     * @returns {DenseLayer}
     */
    static create(inputSize, outputSize, activation) {
        const gain = activation === Activation.RELU ? 2 : 1;
        const weights = Matrix.randomNormal(outputSize, inputSize, Math.sqrt(gain / inputSize));
        return new DenseLayer(weights, Matrix.zeros(outputSize, 1), activation);
    }

    get inputSize() {
        return this.weights.cols;
    }

    get outputSize() {
        return this.weights.rows;
    }

    /**
     * @param {Matrix} input column vector (in x 1)
     * @returns {Matrix} column vector (out x 1)
     */
    forward(input) {
        this.input = input;
        const z = this.weights.dot(input).add(this.biases);
        this.output = z.map(this.activation.apply);
        return this.output;
    }

    /**
     * Backpropagation through this layer (chain rule).
     *
     * @param {Matrix} outputGradient dL/da: how the loss changes with this layer's output
     * @returns {Matrix} dL/dx: how the loss changes with this layer's input
     */
    backward(outputGradient) {
        // dL/dz = dL/da * f'(z)
        const delta = outputGradient.hadamard(this.output.map(this.activation.derivative));

        // z = W.x + b, so dz/dW = x and dz/db = 1
        this.weightGradient = delta.dot(this.input.transpose());
        this.biasGradient = delta;

        // dz/dx = W, so the previous layer receives W^T . delta
        return this.weights.transpose().dot(delta);
    }

    /**
     * Gradient descent step: move the parameters against the gradient.
     * @param {number} learningRate
     */
    applyGradients(learningRate) {
        this.weights = this.weights.subtract(this.weightGradient.scale(learningRate));
        this.biases = this.biases.subtract(this.biasGradient.scale(learningRate));
    }

    toJSON() {
        return {
            activation: this.activation.name,
            weights: this.weights.toRows(),
            biases: this.biases.toRows()
        };
    }

    static fromJSON({activation, weights, biases}) {
        return new DenseLayer(Matrix.fromRows(weights), Matrix.fromRows(biases), Activation.byName(activation));
    }
}
