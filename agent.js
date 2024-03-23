const BATCH_SIZE = 1000;
const DIRECTIONS = {
    RIGHT: 1,
    LEFT: 2,
    UP: 3,
    DOWN: 4
};

class Agent {
    constructor() {
        this.n_games = 0
        this.epsilon = 0 // randomness
        this.gamma = 0.9 // discount rate
        this.memory = new Memory(100_000)

        this.model = this.createModel()
        this.trainer = new QTrainer(this.model, 0.001, this.gamma)
        this.loadModuleWeights()
    }

    createModel() {
        let layers = []
        layers.push(new Layer(
            11,
            11,
            Activation.ReLU,
            Layer.INPUT
        ))
        layers.push(new Layer(
            11,
            256,
            Activation.ReLU,
            Layer.HIDDEN
        ))
        layers.push(new Layer(
            256,
            3,
            Activation.SOFTMAX,
            Layer.OUTPUT
        ))
        return new TrainableNeuralNetwork(layers);
    }


    getState(game) {
        /**
         * @type {{x, y}}
         */
        let head = game.snake[0]
        let point_l = {x: head.x - CELL_WIDTH, y: head.y}
        let point_r = {x: head.x + CELL_WIDTH, y: head.y}
        let point_u = {x: head.x, y: head.y - CELL_WIDTH}
        let point_d = {x: head.x, y: head.y + CELL_WIDTH}

        let dir_l = game.direction == DIRECTIONS.LEFT
        let dir_r = game.direction == DIRECTIONS.RIGHT
        let dir_u = game.direction == DIRECTIONS.UP
        let dir_d = game.direction == DIRECTIONS.DOWN

        let dangerStraight = (dir_r && game.is_collision(point_r)) ||
        (dir_l && game.is_collision(point_l)) ||
        (dir_u && game.is_collision(point_u)) ||
        (dir_d && game.is_collision(point_d)) ? 1 : 0;

        let dangerRight = (dir_u && game.is_collision(point_r)) ||
        (dir_d && game.is_collision(point_l)) ||
        (dir_l && game.is_collision(point_u)) ||
        (dir_r && game.is_collision(point_d)) ? 1 : 0;

        let dangerLeft = (dir_d && game.is_collision(point_r)) ||
        (dir_u && game.is_collision(point_l)) ||
        (dir_r && game.is_collision(point_u)) ||
        (dir_l && game.is_collision(point_d)) ? 1 : 0;
        return [
            dangerStraight,
            dangerRight,
            dangerLeft,

            // # Move direction
            dir_l ? 1 : 0,
            dir_r ? 1 : 0,
            dir_u ? 1 : 0,
            dir_d ? 1 : 0,

            // # Food location
            game.food.x < head.x ? 1 : 0,  // food left
            game.food.x > head.x ? 1 : 0,  // food right
            game.food.y < head.y ? 1 : 0,  // food up
            game.food.y > head.y ? 1 : 0  // food down
        ]
    }

    remember(state, action, reward, nextState, done) {
        this.memory.addSample({
            state: state,
            action: action,
            reward: reward,
            nextState: nextState,
            done: done
        })
    }

    trainLongMemory() {
        const mini_batch = this.memory.sample(BATCH_SIZE)
        this.trainer.train(mini_batch, true)
    }

    trainShortMemory(state, action, reward, nextState, done) {
        this.trainer.train([{
            state: state,
            action: action,
            reward: reward,
            nextState: nextState,
            done: done
        }])
    }

    getAction(state) {
        this.epsilon = 100 - this.n_games
        let steer = [0, 0, 0]
        if (Math.random() * 200 < this.epsilon) {
            let random = Math.floor(Math.random() * 3)
            steer[random] = 1
            return steer
        }
        let outputs = this.model.predict(state)
        console.log(outputs, argMax(outputs))
        steer[argMax(outputs)] = 1
        if(JSON.stringify(steer) !== JSON.stringify([0, 1, 0])){
            console.log(steer)
        }

        return steer
    }

    loadModuleWeights() {
        if (localStorage.getItem('brain')) {
            console.log('Loading brain')
            // this.model.loadWeights(JSON.parse(localStorage.getItem("brain")))
        }
    }
}



/**
 * Retrieve the array key corresponding to the largest element in the array.
 *
 * @param {Array.<number>} array Input array
 * @return {number} Index of array element with largest value
 */
function argMax(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

/**
 * @param {Agent} agent
 * @param game
 * @param stats
 */
function stepFrame(agent, game, stats) {
    let stateOld = agent.getState(game)
    // console.log(stateOld)
    let action = agent.getAction(stateOld)
    changeDirectionFromAction(action)
    let {reward, done, score} = game.playStep()
    let stateNew = agent.getState(game)
    // console.log(reward)
    agent.trainShortMemory(stateOld, action, reward, stateNew, done)
    agent.remember(stateOld, action, reward, stateNew, done)

    if (done) {
        game.init()
        agent.n_games += 1
        agent.trainLongMemory()

        if (score > stats.record) {
            stats.record = score
        }
        agent.model.save()

        console.log('Game', agent.n_games, 'Score', score, 'Record:', stats.record)
        stats.totalScore += score
        let mean_score = stats.totalScore / agent.n_games
        console.log('Mean Score:', mean_score)
    }
}
