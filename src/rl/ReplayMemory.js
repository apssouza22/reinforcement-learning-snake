/**
 * Fixed-capacity buffer of past experiences (ring buffer: the oldest entries
 * are overwritten first).
 */
class ReplayMemory {
    #items = [];
    #next = 0;

    /**
     * @param {number} capacity
     */
    constructor(capacity) {
        this.capacity = capacity;
    }

    get size() {
        return this.#items.length;
    }

    /**
     * @param {Experience} experience
     */
    add(experience) {
        if (this.#items.length < this.capacity) {
            this.#items.push(experience);
        } else {
            this.#items[this.#next] = experience;
        }
        this.#next = (this.#next + 1) % this.capacity;
    }

    /**
     * @param {number} count
     * @returns {Experience[]} up to `count` distinct, randomly picked experiences
     */
    sample(count) {
        const pool = [...this.#items];
        if (pool.length <= count) {
            return pool;
        }
        // Partial Fisher-Yates shuffle: only the first `count` slots are needed
        for (let i = 0; i < count; i++) {
            const j = i + Math.floor(Math.random() * (pool.length - i));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, count);
    }
}
