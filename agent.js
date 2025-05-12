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
        this.learningRate = 0.001

        this.model = this.createModel()
        this.trainer = new QTrainer(this.model, 0.001, this.gamma)
        this.loadModuleWeights()
    }

    createModel() {
        // Create a TensorFlow.js Sequential model
        const tfModel = tf.sequential();
        
        // Input layer
        tfModel.add(tf.layers.dense({
            units: 256,
            activation: 'relu',
            inputShape: [11]
        }));
        
        // Hidden layer
        tfModel.add(tf.layers.dense({
            units: 256,
            activation: 'relu'
        }));
        
        // Output layer (3 actions: straight, right, left)
        tfModel.add(tf.layers.dense({
            units: 3,
            activation: 'linear'
        }));
        
        // Compile the model
        tfModel.compile({
            optimizer: tf.train.adam(this.learningRate),
            loss: 'meanSquaredError'
        });
        
        console.log('TensorFlow.js model created');
        return new TrainableNeuralNetwork(tfModel, this.learningRate);
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

    // [straight, right, left]
    getAction(state) {
        this.epsilon = 100 - this.n_games
        let steer = [0, 0, 0]
        
        // Epsilon-greedy strategy
        if (Math.random() * 200 < this.epsilon) {
            let random = Math.floor(Math.random() * 3)
            steer[random] = 1
            return steer
        }
        
        // Use the model to predict the best action
        let outputs = this.model.predict(state)
        // console.log(outputs, argMax(outputs))
        steer[argMax(outputs)] = 1
        
        if (JSON.stringify(steer) !== JSON.stringify([0, 1, 0])) {
            console.log("Steared", steer)
        }

        return steer
    }

    async loadModuleWeights() {
        try {
            if (localStorage.getItem('brain')) {
                console.log('Loading brain from localStorage');
                await this.model.loadWeights();
            }
        } catch (error) {
            console.error('Error loading model:', error);
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
    // Play 10 frames of the game to speed up training
    for (let i = 0; i < 1; i++) {
        // We use tf.tidy to clean up tensors after each step
        tf.tidy(() => {
            let stateOld = agent.getState(game)
            let action = agent.getAction(stateOld)
            changeDirectionFromAction(action)
            let {reward, done, score} = game.playStep()
            let stateNew = agent.getState(game)
            agent.trainShortMemory(stateOld, action, reward, stateNew, done)
            agent.remember(stateOld, action, reward, stateNew, done)

            if (done) {
                game.init()
                agent.n_games += 1
                agent.trainLongMemory()

                if (score > stats.record) {
                    stats.record = score
                }

                console.log('Game', agent.n_games, 'Score', score, 'Record:', stats.record)
                stats.totalScore += score
                let mean_score = stats.totalScore / agent.n_games
                console.log('Mean Score:', mean_score)
            }

            if(game.n_games % 100 === 0) {
                agent.model.save('brain')
            }
        });
    }
}
