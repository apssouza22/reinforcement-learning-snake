/**
 * A minimal matrix: just enough linear algebra to build a neural network.
 *
 * Every operation returns a NEW matrix and never mutates its operands, so it is
 * easy to follow what happens to the data at each step.
 *
 * The values live in ONE flat array, row after row (row-major order), which is
 * how real numeric libraries store matrices: the cell (i, j) is at index
 * `i * cols + j`.
 */
class Matrix {
    /**
     * @param {number} rows
     * @param {number} cols
     * @param {Float64Array} values optional initial values (rows * cols), zeros by default
     */
    constructor(rows, cols, values = new Float64Array(rows * cols)) {
        this.rows = rows;
        this.cols = cols;
        this.values = values;
    }

    // ---------------------------------------------------------------- factories

    /**
     * @returns {Matrix} a matrix filled with zeros
     */
    static zeros(rows, cols) {
        return new Matrix(rows, cols);
    }

    /**
     * Fills a matrix with normally distributed random values.
     * @param {number} rows
     * @param {number} cols
     * @param {number} standardDeviation
     * @returns {Matrix}
     */
    static randomNormal(rows, cols, standardDeviation = 1) {
        return Matrix.zeros(rows, cols).map(() => Matrix.#gaussian() * standardDeviation);
    }

    /**
     * Box-Muller transform: turns two uniform numbers into a normal one.
     */
    static #gaussian() {
        const u = 1 - Math.random(); // (0, 1], avoids log(0)
        const v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    /**
     * @param {number[]} values
     * @returns {Matrix} a column vector (values.length x 1)
     */
    static fromArray(values) {
        return new Matrix(values.length, 1, Float64Array.from(values));
    }

    /**
     * @param {number[][]} rows e.g. [[1, 2, 3], [4, 5, 6]]
     * @returns {Matrix}
     */
    static fromRows(rows) {
        return new Matrix(rows.length, rows[0].length, Float64Array.from(rows.flat()));
    }

    // ------------------------------------------------------------ conversions

    /**
     * @returns {number[]} the values, row by row
     */
    toArray() {
        return Array.from(this.values);
    }

    /**
     * @returns {number[][]} the values as a list of rows
     */
    toRows() {
        const rows = [];
        for (let i = 0; i < this.rows; i++) {
            rows.push(Array.from(this.values.subarray(i * this.cols, (i + 1) * this.cols)));
        }
        return rows;
    }

    toJSON() {
        return this.toRows();
    }

    /**
     * @param {number} row
     * @param {number} col
     * @returns {number}
     */
    get(row, col) {
        return this.values[row * this.cols + col];
    }

    // --------------------------------------------------------------- operations

    /**
     * Matrix product (dot product): (n x m) * (m x p) = (n x p).
     * Each cell is the dot product of a row of `this` with a column of `other`.
     * @param {Matrix} other
     * @returns {Matrix}
     */
    dot(other) {
        if (this.cols !== other.rows) {
            throw new Error(`Cannot multiply ${this.rows}x${this.cols} by ${other.rows}x${other.cols}`);
        }
        const result = Matrix.zeros(this.rows, other.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < other.cols; j++) {
                let sum = 0;
                for (let k = 0; k < this.cols; k++) {
                    sum += this.values[i * this.cols + k] * other.values[k * other.cols + j];
                }
                result.values[i * other.cols + j] = sum;
            }
        }
        return result;
    }

    /**
     * Element-wise product (Hadamard): same shape, cell by cell.
     * @param {Matrix} other
     * @returns {Matrix}
     */
    hadamard(other) {
        return this.#combine(other, (a, b) => a * b);
    }

    /**
     * @param {Matrix} other same shape
     * @returns {Matrix}
     */
    add(other) {
        return this.#combine(other, (a, b) => a + b);
    }

    /**
     * @param {Matrix} other same shape
     * @returns {Matrix}
     */
    subtract(other) {
        return this.#combine(other, (a, b) => a - b);
    }

    /**
     * @param {number} factor
     * @returns {Matrix} every cell multiplied by the factor
     */
    scale(factor) {
        return this.map(value => value * factor);
    }

    /**
     * @returns {Matrix} rows and columns swapped
     */
    transpose() {
        const result = Matrix.zeros(this.cols, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.values[j * this.rows + i] = this.values[i * this.cols + j];
            }
        }
        return result;
    }

    /**
     * @param {function(number): number} fn
     * @returns {Matrix} fn applied to every cell
     */
    map(fn) {
        const result = Matrix.zeros(this.rows, this.cols);
        for (let i = 0; i < this.values.length; i++) {
            result.values[i] = fn(this.values[i]);
        }
        return result;
    }

    #combine(other, fn) {
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error(`Shape mismatch: ${this.rows}x${this.cols} vs ${other.rows}x${other.cols}`);
        }
        const result = Matrix.zeros(this.rows, this.cols);
        for (let i = 0; i < this.values.length; i++) {
            result.values[i] = fn(this.values[i], other.values[i]);
        }
        return result;
    }
}
