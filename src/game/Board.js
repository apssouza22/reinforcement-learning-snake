/**
 * The playing field: a rectangular grid of cells.
 */
class Board {
    /**
     * @param {number} width number of columns
     * @param {number} height number of rows
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * @param {Point} point
     * @returns {boolean}
     */
    contains(point) {
        return point.x >= 0 && point.x < this.width && point.y >= 0 && point.y < this.height;
    }

    /**
     * @returns {Point[]} every cell of the board
     */
    cells() {
        const cells = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                cells.push(new Point(x, y));
            }
        }
        return cells;
    }
}
