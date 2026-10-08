/**
 * Lets a human steer the snake with the arrow keys.
 */
class KeyboardController {
    static #DIRECTIONS = new Map([
        ['ArrowLeft', Direction.LEFT],
        ['ArrowUp', Direction.UP],
        ['ArrowRight', Direction.RIGHT],
        ['ArrowDown', Direction.DOWN]
    ]);

    /**
     * @param {SnakeGame} game
     * @param {EventTarget} target
     */
    constructor(game, target = window) {
        this.game = game;
        this.target = target;
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    attach() {
        this.target.addEventListener('keydown', this.onKeyDown);
    }

    detach() {
        this.target.removeEventListener('keydown', this.onKeyDown);
    }

    /**
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        const direction = KeyboardController.#DIRECTIONS.get(event.key);
        if (direction) {
            event.preventDefault();
            this.game.steer(direction);
        } else if (event.key === ' ') {
            event.preventDefault();
        }
    }
}
