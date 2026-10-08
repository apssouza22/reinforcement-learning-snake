/**
 * An activation function and its derivative.
 *
 * Activations add the non-linearity that lets a network learn more than a
 * straight line. For backpropagation we also need the derivative, expressed
 * here as a function of the activation OUTPUT `a = f(z)`, which is cheaper than
 * recomputing from the input `z`.
 */
class Activation {
    static IDENTITY = new Activation('identity', z => z, () => 1);

    static RELU = new Activation('relu', z => Math.max(0, z), a => (a > 0 ? 1 : 0));

    // f'(z) = f(z) * (1 - f(z))
    static SIGMOID = new Activation('sigmoid', z => 1 / (1 + Math.exp(-z)), a => a * (1 - a));

    // f'(z) = 1 - f(z)^2
    static TANH = new Activation('tanh', Math.tanh, a => 1 - a * a);

    /**
     * @param {string} name used to save and restore networks
     * @param {function(number): number} apply f(z)
     * @param {function(number): number} derivative f'(z) written in terms of a = f(z)
     */
    constructor(name, apply, derivative) {
        this.name = name;
        this.apply = apply;
        this.derivative = derivative;
    }

    /**
     * @param {string} name
     * @returns {Activation}
     */
    static byName(name) {
        const found = [Activation.IDENTITY, Activation.RELU, Activation.SIGMOID, Activation.TANH]
            .find(activation => activation.name === name);
        if (!found) {
            throw new Error(`Unknown activation: ${name}`);
        }
        return found;
    }
}
