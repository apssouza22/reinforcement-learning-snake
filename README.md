# reinforcement-learning-snake
This is a simple implementation of the snake game using reinforcement learning. The snake is trained using the Q-learning algorithm. The snake learns to play the game by itself. The snake is rewarded when it eats the food and penalized when it hits the wall or itself.

The game and the Q-learning loop are implemented in vanilla JavaScript; [TensorFlow.js](https://www.tensorflow.org/js) is used for the neural network. Open `index.html` in a browser to watch the snake learn.

## Structure

```
src/
  game/       Game rules and presentation
    Point, Direction (+ Action), Board, Snake, SnakeGame   pure domain model
    CanvasRenderer, KeyboardController                      I/O adapters
  rl/         Reinforcement learning
    StateEncoder         game -> observation vector
    EpsilonGreedyPolicy  exploration strategy
    ReplayMemory         ring buffer of Experience objects
    QNetwork             TensorFlow.js model behind a plain-array API
    QTrainer             Bellman targets + gradient step
    Agent                composes the pieces above
  training/
    TrainingSession      agent <-> game loop
    TrainingStats        record / mean score
  main.js     composition root (wires everything together)
```
