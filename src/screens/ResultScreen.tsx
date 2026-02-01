import { useGame } from "../context/GameContext";

export function ResultScreen() {
  const { state, resetGame, startGame } = useGame();

  const handleReplay = () => {
    resetGame();
  };

  const handlePlayAgain = () => {
    startGame();
  };

  const isWin = state.lastResult === "win";

  return (
    <div className="result-screen">
      <div className="result-content">
        <h1 className={`result-title ${isWin ? "win" : "lose"}`}>
          {isWin ? "You Win!" : "You Lose!"}
        </h1>

        <div className="result-message">
          {isWin ? (
            <p>Congratulations! You caught all the items!</p>
          ) : (
            <p>You missed too many items!</p>
          )}
        </div>

        <div className="result-actions">
          <button
            className="action-button primary"
            onClick={handlePlayAgain}
            aria-label="Play again with same food"
          >
            Play Again with Same Food
          </button>

          <button
            className="action-button secondary"
            onClick={handleReplay}
            aria-label="Choose a different food"
          >
            Choose Different Food
          </button>
        </div>
      </div>
    </div>
  );
}
