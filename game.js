document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    window.addEventListener("keydown", handleKeyDown, false);
    window.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', changeDirection);

});
const CELL_WIDTH = 10;

let keys = [];
let canvas = document.getElementById('canvas');
let context = canvas.getContext("2d");
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let direction;
let food;
let score;
let snake;
let gameOver = false;
let reward = 0;
let agent = new Agent();
let stats = {
    totalScore: 0,
    record: 0
}

let game = {
    score: score,
    snake: snake,
    food: food,
    direction: DIRECTIONS.RIGHT,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    is_collision: function (point) {
        return checkCollision(point.x, point.y, canvasWidth, CELL_WIDTH, snake, canvasHeight);
    },
    playStep: function () {
        paint();
        return {
            done: gameOver,
            score: score,
            reward: reward
        }
    },
    init: function (){
        initializeGame();
    },

}

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
    gameOver = false;
    game.direction = direction;
    game.score = score;
    game.snake = snake;
    game.food = food;

    if (typeof setIntervalRef != "undefined") clearInterval(setIntervalRef);
    setIntervalRef = setInterval(()=>{
        stepFrame(agent, game, stats);
    }, 60);
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

    if (checkCollision(newX, newY, canvasWidth, CELL_WIDTH,snake, canvasHeight) ) {
        reward = -10
        gameOver = true;
        // initializeGame();
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
        reward = 10
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

function checkItselfCollision(x, y, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].x === x && array[i].y === y) return true;
    }
    return false;
}

function checkCollision(newX, newY, canvasWidth, CELL_WIDTH,snake, canvasHeight) {
    return isOutsideCanvas(newX, canvasWidth, CELL_WIDTH, newY, canvasHeight)
        || checkItselfCollision(newX, newY, snake)
}

function changeDirection(e) {
    let key = e.which;
    if (key == "37" && direction != DIRECTIONS.RIGHT) direction = DIRECTIONS.LEFT;
    else if (key == "38" && direction != DIRECTIONS.DOWN) direction = DIRECTIONS.UP;
    else if (key == "39" && direction != DIRECTIONS.LEFT) direction = DIRECTIONS.RIGHT;
    else if (key == "40" && direction != DIRECTIONS.UP) direction = DIRECTIONS.DOWN;
}

function changeDirectionFromAction(action) {
    // get direction from array action. [straight, right, left]
    if (action[1] === 1 && direction != DIRECTIONS.RIGHT) direction = DIRECTIONS.LEFT;
    else if (action[2] === 1 && direction != DIRECTIONS.LEFT) direction = DIRECTIONS.RIGHT;
    else if (action[0] === 1 && direction != DIRECTIONS.DOWN) direction = DIRECTIONS.UP;
    else if (action[3] === 1 && direction != DIRECTIONS.UP) direction = DIRECTIONS.DOWN;
}