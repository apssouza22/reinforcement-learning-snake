/**
 * Translates the game into the numeric observation fed to the network.
 *
 * Layout (11 values):
 * [danger straight, danger right, danger left,
 *  heading left, right, up, down,
 *  food left, right, up, down]
 */
class StateEncoder {
    static SIZE = 11;

    /**
     * @param {SnakeGame} game
     * @returns {number[]}
     */
    encode(game) {
        const {head, direction} = game.snake;
        const food = game.food;

        return [
            this.#danger(game, direction.turn(Action.STRAIGHT)),
            this.#danger(game, direction.turn(Action.RIGHT)),
            this.#danger(game, direction.turn(Action.LEFT)),

            direction === Direction.LEFT ? 1 : 0,
            direction === Direction.RIGHT ? 1 : 0,
            direction === Direction.UP ? 1 : 0,
            direction === Direction.DOWN ? 1 : 0,

            food.x < head.x ? 1 : 0,
            food.x > head.x ? 1 : 0,
            food.y < head.y ? 1 : 0,
            food.y > head.y ? 1 : 0
        ];
    }

    #danger(game, direction) {
        return game.isCollision(game.snake.head.move(direction)) ? 1 : 0;
    }
}
