/**
 * Outcome of a single game step.
 * @typedef {Object} StepResult
 * @property {number} reward
 * @property {boolean} done
 * @property {number} score
 */

/**
 * Pure game rules: no rendering, no timers, no input handling.
 */
class SnakeGame {
    static FOOD_REWARD = 10;
    static DEATH_REWARD = -10;
    static SPAWN_POINT = new Point(10, 8); // head position of a new snake
    static INITIAL_LENGTH = 3;

    /**
     * @param {Board} board
     * @param {function(): number} random source of numbers in [0, 1)
     */
    constructor(board, random = Math.random) {
        this.board = board;
        this.random = random;
        this.reset();
    }

    get direction() {
        return this.snake.direction;
    }

    /**
     * Starts a new game.
     */
    reset() {
        this.snake = Snake.spawn(SnakeGame.SPAWN_POINT, SnakeGame.INITIAL_LENGTH);
        this.score = 0;
        this.over = false;
        this.food = null;
        this.#placeFood();
    }

    /**
     * Whether stepping onto the point would hurt the snake.
     * @param {Point} point
     * @returns {boolean}
     */
    isCollision(point) {
        return !this.board.contains(point) || this.snake.occupies(point);
    }

    /**
     * Absolute steering, used for human input.
     * @param {Direction} direction
     */
    steer(direction) {
        this.snake.steer(direction);
    }

    /**
     * Advances the game by one tick.
     * @param {number} action one of {@link Action}
     * @returns {StepResult}
     */
    step(action) {
        this.snake.turn(action);

        if (this.isCollision(this.snake.nextHead())) {
            this.over = true;
            return this.#result(SnakeGame.DEATH_REWARD);
        }

        const eats = this.snake.nextHead().equals(this.food);
        this.snake.advance(eats);
        if (!eats) {
            return this.#result(0);
        }

        this.score++;
        // A full board means the game has been won
        this.over = !this.#placeFood();
        return this.#result(SnakeGame.FOOD_REWARD);
    }

    #result(reward) {
        return {reward, done: this.over, score: this.score};
    }

    /**
     * Places the food on a random free cell.
     * @returns {boolean} false when the board has no free cell left
     */
    #placeFood() {
        const freeCells = this.board.cells().filter(cell => !this.snake.occupies(cell));
        if (freeCells.length === 0) {
            return false;
        }
        this.food = freeCells[Math.floor(this.random() * freeCells.length)];
        return true;
    }
}
