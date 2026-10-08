/**
 * Relative moves available to the agent. The values double as the indexes of
 * the neural network outputs.
 */
const Action = Object.freeze({
    STRAIGHT: 0,
    RIGHT: 1,
    LEFT: 2,
    COUNT: 3
});

/**
 * Absolute heading of the snake on the grid (type-safe enum).
 */
class Direction {
    static RIGHT = new Direction('RIGHT', 1, 0);
    static DOWN = new Direction('DOWN', 0, 1);
    static LEFT = new Direction('LEFT', -1, 0);
    static UP = new Direction('UP', 0, -1);

    /** Clockwise order, used to resolve relative turns. */
    static CLOCKWISE = Object.freeze([Direction.RIGHT, Direction.DOWN, Direction.LEFT, Direction.UP]);

    /**
     * @param {string} name
     * @param {number} dx
     * @param {number} dy
     */
    constructor(name, dx, dy) {
        this.name = name;
        this.dx = dx;
        this.dy = dy;
        Object.freeze(this);
    }

    /**
     * @param {number} action one of {@link Action}
     * @returns {Direction} the heading after applying a relative move
     */
    turn(action) {
        const clockwise = Direction.CLOCKWISE;
        const index = clockwise.indexOf(this);
        switch (action) {
            case Action.STRAIGHT:
                return this;
            case Action.RIGHT:
                return clockwise[(index + 1) % 4];
            case Action.LEFT:
                return clockwise[(index + 3) % 4];
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * @returns {Direction}
     */
    opposite() {
        const clockwise = Direction.CLOCKWISE;
        return clockwise[(clockwise.indexOf(this) + 2) % 4];
    }

    toString() {
        return this.name;
    }
}
