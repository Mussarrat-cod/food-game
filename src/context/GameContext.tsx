import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { GameState, FoodType, GameResult } from "../types";

interface GameContextType {
  state: GameState;
  selectFood: (food: FoodType) => void;
  startGame: () => void;
  endGame: (result: GameResult) => void;
  resetGame: () => void;
  setItemCount: (count: number) => void;
  setLives: (lives: number) => void;
  setTargetItemCount: (count: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: "SELECT_FOOD"; payload: FoodType }
  | { type: "START_GAME" }
  | { type: "END_GAME"; payload: GameResult }
  | { type: "RESET_GAME" }
  | { type: "SET_ITEM_COUNT"; payload: number }
  | { type: "SET_LIVES"; payload: number }
  | { type: "SET_TARGET_ITEM_COUNT"; payload: number };

const initialState: GameState = {
  currentScreen: "start",
  selectedFood: null,
  lastResult: null,
  itemCount: 0,
  lives: 3,
  targetItemCount: 10,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_FOOD":
      return {
        ...state,
        selectedFood: action.payload,
      };
    case "START_GAME":
      return {
        ...state,
        currentScreen: "game",
        itemCount: 0,
        lives: 3,
      };
    case "END_GAME":
      return {
        ...state,
        currentScreen: "result",
        lastResult: action.payload,
      };
    case "RESET_GAME":
      return {
        ...state,
        currentScreen: "start",
        selectedFood: null,
        lastResult: null,
        itemCount: 0,
        lives: 3,
        targetItemCount: 10,
      };
    case "SET_ITEM_COUNT":
      return {
        ...state,
        itemCount: action.payload,
      };
    case "SET_LIVES":
      return {
        ...state,
        lives: action.payload,
      };
    case "SET_TARGET_ITEM_COUNT":
      return {
        ...state,
        targetItemCount: action.payload,
      };
    default:
      return state;
  }
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const selectFood = useCallback((food: FoodType) => {
    dispatch({ type: "SELECT_FOOD", payload: food });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
  }, []);

  const endGame = useCallback((result: GameResult) => {
    dispatch({ type: "END_GAME", payload: result });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  const setItemCount = useCallback((count: number) => {
    dispatch({ type: "SET_ITEM_COUNT", payload: count });
  }, []);

  const setLives = useCallback((lives: number) => {
    dispatch({ type: "SET_LIVES", payload: lives });
  }, []);

  const setTargetItemCount = useCallback((count: number) => {
    dispatch({ type: "SET_TARGET_ITEM_COUNT", payload: count });
  }, []);

  const value: GameContextType = useMemo(
    () => ({
      state,
      selectFood,
      startGame,
      endGame,
      resetGame,
      setItemCount,
      setLives,
      setTargetItemCount,
    }),
    [
      state,
      selectFood,
      startGame,
      endGame,
      resetGame,
      setItemCount,
      setLives,
      setTargetItemCount,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
