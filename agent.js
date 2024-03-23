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
        this.model = new TrainableNeuralNetwork([11, 256, 3], Activation.ReLU)
        this.trainer = new QTrainer(this.model, 0.001, this.gamma)
        this.loadModuleWeights()
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
        if(JSON.stringify(steer) !== JSON.stringify([1, 0, 0])){
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


class QTrainer {
    totalLoss = 0
    totalTrain = 0

    constructor(model, lr, gamma) {
        this.model = model
        this.lr = lr
        this.gamma = gamma
    }

    /**
     * @param {Array} samples
     * @param long
     */
    train(samples, long = false) {
        if (long) {
            console.log('Training long memory')
        }
        for (const sample of samples) {
            this.totalTrain++
            const pred = this.model.predict(sample.state)
            let Q_new = sample.reward
            if (!sample.done) {
                // Bellman equation
                Q_new = sample.reward + this.gamma * Math.max(...this.model.predict(sample.nextState))
            }
            let target = [...pred]
            target[argMax(sample.action)] = Q_new
            // for (const action in sample.action) {
            //     if (sample.action[action] > 0) {
            //         target[action] = Q_new
            //     }
            // }
            // target[argMax(sample.action)] = Q_new
            this.model.feedForward(sample.state, true);
            this.model.calculateLoss(target)
            this.model.updateWeights()
            let loss = mse(pred, target)
            this.totalLoss += loss
        }
        if (long) {
            let meanLoss = this.totalLoss / this.totalTrain
            console.log(`Mean loss: ${meanLoss}`)
        }
    }
}

function mse(a, b) {
    let error = 0
    for (let i = 0; i < a.length; i++) {
        error += Math.pow((b[i] - a[i]), 2)
    }
    return error / a.length
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

/**
 * @param {Game} game
 */
function trainRLAgent(game) {
    let stats = {
        totalScore: 0,
        record: 0
    }
    let agent = new Agent()
    frame()

    function frame() {
        for (let i = 0; i < GAME_STEP_PER_FRAME; i++) {
            stepFrame(agent, game, stats);
        }
        requestAnimationFrame(frame);
    }
}

class LRHelper {
    static sensorData = []

    static checkGameOver(car) {
        if (car.damaged && GAME_INFO.brainMode != "GA") {
            return {
                reward: -100,
                gameOver: true,
                score: car.calcFitness() + car.y * -1,
            }
        }
        return {
            gameOver: false,
        }
    }


    static getRewards(car, reward, prevTotalCarsOverTaken) {
        car.getSensorData().forEach((sensor, index) => {
            if (sensor > 0.5) {
                if (LRHelper.sensorData[index] < sensor) {
                    reward -= (sensor * 100) / 5
                }
            } else {
                reward += 1
            }
        })
        LRHelper.sensorData = car.getSensorData()

        // if (car.speed > 1) {
        //     reward += 5
        // } else {
        //     reward -= 7
        // }

        if (prevTotalCarsOverTaken < car.totalCarsOvertaken) {
            reward = 10
        }
        // console.log(reward)
        return reward;
    }
}