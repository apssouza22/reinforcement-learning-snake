/**
 * Composition root: wires every collaborator together and starts training.
 */
(function main() {
    const CELL_SIZE = 10;
    const LAYER_SIZES = [StateEncoder.SIZE, 256, Action.COUNT];
    const LEARNING_RATE = 0.001;
    const GAMMA = 0.9;

    const canvas = document.getElementById('canvas');
    const board = new Board(canvas.width / CELL_SIZE, canvas.height / CELL_SIZE);
    const game = new SnakeGame(board);

    const modelStore = new ModelStore('brain');
    const network = loadSavedNetwork(modelStore) ?? NeuralNetwork.create(LAYER_SIZES, LEARNING_RATE);

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
        modelStore
    }).start(60);

    /**
     * @returns {NeuralNetwork|null} the saved network, if it exists and fits this game
     */
    function loadSavedNetwork(store) {
        try {
            const saved = store.load();
            if (saved && saved.inputSize === LAYER_SIZES[0] && saved.outputSize === Action.COUNT) {
                console.log('Loaded brain from localStorage');
                return saved;
            }
        } catch (error) {
            console.error('Error loading model:', error);
        }
        return null;
    }
})();
