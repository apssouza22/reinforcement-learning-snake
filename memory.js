
class Memory {

    /**
     * @param {number} maxMemory
     */
    constructor(maxMemory) {
        this.maxMemory = maxMemory;
        this.samples = [];
    }

    /**
     * @param {Object} sample
     */
    addSample(sample) {
        this.samples.push(sample);
        if (this.samples.length > this.maxMemory) {
            this.samples.shift();
        }
    }

    /**
     * @param {number} nSamples
     * @returns {Array} Randomly selected samples
     */
    sample(nSamples) {
        return this.#sampleSize(this.samples, nSamples);
    }

    #sampleSize([...arr], n = 1) {
        let m = arr.length;
        if (m < n) {
            return arr;
        }
        while (m) {
            const i = Math.floor(Math.random() * m--);
            [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        return arr.slice(0, n);
    }
}