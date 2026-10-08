/**
 * Persists a network as JSON in a key-value storage (localStorage in the browser).
 */
class ModelStore {
    /**
     * @param {string} key
     * @param {Storage} storage anything with getItem / setItem
     */
    constructor(key = 'brain', storage = localStorage) {
        this.key = key;
        this.storage = storage;
    }

    /**
     * @param {NeuralNetwork} network
     */
    save(network) {
        this.storage.setItem(this.key, JSON.stringify(network));
    }

    /**
     * @returns {NeuralNetwork|null} the saved network, or null if there is none
     */
    load() {
        const json = this.storage.getItem(this.key);
        return json ? NeuralNetwork.fromJSON(JSON.parse(json)) : null;
    }
}
