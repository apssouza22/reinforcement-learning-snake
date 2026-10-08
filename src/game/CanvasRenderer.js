/**
 * Draws a {@link SnakeGame} on an HTML canvas.
 */
class CanvasRenderer {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} cellSize size of a grid cell in pixels
     */
    constructor(canvas, cellSize = 10) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.cellSize = cellSize;
    }

    /**
     * @param {SnakeGame} game
     */
    render(game) {
        this.#clear();
        game.snake.body.forEach(segment => this.#paintCell(segment, 'blue'));
        this.#paintCell(game.food, 'red');
        this.#paintScore(game.score);
    }

    #clear() {
        const {context, canvas} = this;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = 'black';
        context.strokeRect(0, 0, canvas.width, canvas.height);
    }

    #paintCell(point, color) {
        const {context, cellSize} = this;
        context.fillStyle = color;
        context.fillRect(point.x * cellSize, point.y * cellSize, cellSize, cellSize);
        context.strokeStyle = 'white';
        context.strokeRect(point.x * cellSize, point.y * cellSize, cellSize, cellSize);
    }

    #paintScore(score) {
        this.context.fillText('Score: ' + score, 5, this.canvas.height - 5);
    }
}
