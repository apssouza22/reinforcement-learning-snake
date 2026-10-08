/**
 * The snake: an ordered list of cells (head first) and a heading.
 */
class Snake {
    /**
     * @param {Point[]} body cells ordered from head to tail
     * @param {Direction} direction
     */
    constructor(body, direction) {
        this.body = [...body];
        this.direction = direction;
    }

    /**
     * Creates a horizontal snake heading right, whose head is at `head`.
     * @param {Point} head
     * @param {number} length
     * @returns {Snake}
     */
    static spawn(head, length = 3) {
        const body = [];
        for (let i = 0; i < length; i++) {
            body.push(new Point(head.x - i, head.y));
        }
        return new Snake(body, Direction.RIGHT);
    }

    get head() {
        return this.body[0];
    }

    get length() {
        return this.body.length;
    }

    /**
     * @param {Point} point
     * @returns {boolean} true if any segment is on the cell
     */
    occupies(point) {
        return this.body.some(segment => segment.equals(point));
    }

    /**
     * Changes heading, ignoring attempts to reverse onto itself.
     * @param {Direction} direction
     */
    steer(direction) {
        if (direction !== this.direction.opposite()) {
            this.direction = direction;
        }
    }

    /**
     * Applies a relative move to the current heading.
     * @param {number} action one of {@link Action}
     */
    turn(action) {
        this.direction = this.direction.turn(action);
    }

    /**
     * @returns {Point} the cell the head will enter on the next advance
     */
    nextHead() {
        return this.head.move(this.direction);
    }

    /**
     * Moves the head one cell forward. The tail follows unless the snake grows.
     * @param {boolean} grow
     */
    advance(grow = false) {
        this.body.unshift(this.nextHead());
        if (!grow) {
            this.body.pop();
        }
    }
}
