/**
 * Composition root: wires every collaborator together and starts training.
 */
(async function main() {
    const CELL_SIZE = 10;
    const MODEL_KEY = 'brain';
    const LEARNING_RATE = 0.001;
    const GAMMA = 0.9;

    const canvas = document.getElementById('canvas');
    const board = new Board(canvas.width / CELL_SIZE, canvas.height / CELL_SIZE);
    const game = new SnakeGame(board);

    const network = QNetwork.create({
        inputSize: StateEncoder.SIZE,
        outputSize: Action.COUNT,
        hiddenUnits: [256, 256],
        learningRate: LEARNING_RATE
    });
    try {
        if (await network.load(MODEL_KEY)) {
            console.log('Loaded brain from localStorage');
        }
    } catch (error) {
        console.error('Error loading model:', error);
    }

    const agent = new Agent({
        network,
        trainer: new QTrainer(network, GAMMA),
        memory: new ReplayMemory(100_000),
        policy: new EpsilonGreedyPolicy(),
        batchSize: 1000
    });

    new KeyboardController(game).attach();

    new TrainingSession({
        game,
        agent,
        encoder: new StateEncoder(),
        renderer: new CanvasRenderer(canvas, CELL_SIZE),
        modelKey: MODEL_KEY
    }).start(60);
})();
