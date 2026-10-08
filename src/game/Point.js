/**
 * Immutable value object representing a cell on the board grid.
 */
class Point {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        Object.freeze(this);
    }

    /**
     * @param {Direction} direction
     * @returns {Point} the neighbouring cell in the given direction
     */
    move(direction) {
        return new Point(this.x + direction.dx, this.y + direction.dy);
    }

    /**
     * @param {Point} other
     * @returns {boolean}
     */
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}
