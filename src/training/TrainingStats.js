/**
 * Aggregated results of the games played so far.
 */
class TrainingStats {
    games = 0;
    record = 0;
    totalScore = 0;

    /**
     * @param {number} score score of a finished game
     */
    recordGame(score) {
        this.games++;
        this.totalScore += score;
        this.record = Math.max(this.record, score);
    }

    get meanScore() {
        return this.games ? this.totalScore / this.games : 0;
    }
}
