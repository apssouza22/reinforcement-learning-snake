document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    window.addEventListener("keydown", handleKeyDown, false);
    window.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', changeDirection);

});
const CELL_WIDTH = 10;
const DIRECTIONS = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
};

let keys = [];
let canvas = document.getElementById('canvas');
let context = canvas.getContext("2d");
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let direction;
let food;
let score;
let snake;


initializeGame();

function isOutsideCanvas(newX, canvasWidth, CELL_WIDTH, newY, canvasHeight) {
    return newX == -1 || newX == canvasWidth / CELL_WIDTH || newY == -1 || newY == canvasHeight / CELL_WIDTH;
}

function handleKeyDown(e) {
    keys[e.keyCode] = true;
    preventDefaultForArrowKeysAndSpace(e);
}

function handleKeyUp(e) {
    keys[e.keyCode] = false;
}

function preventDefaultForArrowKeysAndSpace(e) {
    switch(e.keyCode){
        case 37: case 39: case 38:  case 40: // Arrow keys
        case 32: e.preventDefault(); break; // Space
        default: break; // do not block other keys
    }
}

function initializeGame() {
    direction = DIRECTIONS.RIGHT;
    createSnake();
    createFood();
    score = 0;

    if (typeof game_loop != "undefined") clearInterval(game_loop);
    game_loop = setInterval(paint, 60);
}

function createSnake() {
    let length = 5;
    snake = [];
    for (let i = length - 1; i >= 0; i--) {
        snake.push({ x: i, y: 0 });
    }
}

function createFood() {
    food = {
        x: Math.round(Math.random() * (canvasWidth - CELL_WIDTH) / CELL_WIDTH),
        y: Math.round(Math.random() * (canvasHeight - CELL_WIDTH) / CELL_WIDTH),
    };
}

function paint() {
    clearCanvas();
    updateSnakePosition();
    checkFoodCollision();
    paintSnake();
    paintFood();
    paintScore();
}

function clearCanvas() {
    context.fillStyle = "white";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.strokeStyle = "black";
    context.strokeRect(0, 0, canvasWidth, canvasHeight);
}

function updateSnakePosition() {
    let newX = snake[0].x;
    let newY = snake[0].y;

    if (direction == DIRECTIONS.RIGHT) newX++;
    else if (direction == DIRECTIONS.LEFT) newX--;
    else if (direction == DIRECTIONS.UP) newY--;
    else if (direction == DIRECTIONS.DOWN) newY++;

    if (isOutsideCanvas(newX, canvasWidth, CELL_WIDTH, newY, canvasHeight) || checkCollision(newX, newY, snake)) {
        initializeGame();
        return;
    }

    let tail = snake.pop();
    tail.x = newX;
    tail.y = newY;
    snake.unshift(tail);
}

function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        let tail = { x: snake[0].x, y: snake[0].y };
        score++;
        createFood();
        snake.unshift(tail);
    }
}

function paintSnake() {
    for (let i = 0; i < snake.length; i++) {
        paintCell(snake[i].x, snake[i].y, "blue");
    }
}

function paintFood() {
    paintCell(food.x, food.y, "red");
}

function paintScore() {
    const scoreText = "Score: " + score;
    context.fillText(scoreText, 5, canvasHeight - 5);
}

function paintCell(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    context.strokeStyle = "white";
    context.strokeRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
}

function checkCollision(x, y, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].x === x && array[i].y === y) return true;
    }
    return false;
}

function changeDirection(e) {
    let key = e.which;
    if (key == "37" && direction != DIRECTIONS.RIGHT) direction = DIRECTIONS.LEFT;
    else if (key == "38" && direction != DIRECTIONS.DOWN) direction = DIRECTIONS.UP;
    else if (key == "39" && direction != DIRECTIONS.LEFT) direction = DIRECTIONS.RIGHT;
    else if (key == "40" && direction != DIRECTIONS.UP) direction = DIRECTIONS.DOWN;
}