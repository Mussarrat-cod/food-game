export type FoodType = "shawarma" | "milkshake" | "laptop";

export type GameResult = "win" | "lose";

export type GameScreen = "start" | "game" | "result";

export interface GameState {
  currentScreen: GameScreen;
  selectedFood: FoodType | null;
  lastResult: GameResult | null;
  itemCount: number;
  lives: number;
  targetItemCount: number;
}

export interface FallingObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: "good" | "bad" | "heart";
}

export interface Cup {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  mouseX: number;
  isDragging: boolean;
}

// Game Settings Types
export interface GameSettings {
  highScore: number;
  soundEnabled: boolean;
  difficulty: "easy" | "normal" | "hard";
  showFPS: boolean;
  particleEffects: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  totalItemsCollected: number;
  bestStreak: number;
  averageGameTime: number;
}
