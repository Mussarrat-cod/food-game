import { useGame } from "../context/GameContext";
import { FoodType } from "../types";
import shawarma from "../assets/shawarma.png";
import milkshake from "../assets/milkshake.png";
import laptop from "../assets/laptop.png";

export function StartScreen() {
  const { selectFood, startGame } = useGame();

  const handleFoodSelect = (food: FoodType) => {
    selectFood(food);
    startGame();
  };

  const items: {
    type: FoodType;
    name: string;
    image: string;
    difficulty: string;
  }[] = [
    { type: "shawarma", name: "Shawarma", image: shawarma, difficulty: "Easy" },
    { type: "milkshake", name: "Milkshake", image: milkshake, difficulty: "Medium" },
    { type: "laptop", name: "Laptop", image: laptop, difficulty: "Hard" },
  ];

  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="game-title">Food Catcher</h1>
        <p className="game-subtitle">Choose your food to start</p>

        <div className="food-selection">
          {items.map((food) => (
            <div key={food.type} className="food-option">
              <button
                className="food-button"
                onClick={() => handleFoodSelect(food.type)}
                aria-label={`Select ${food.name} food`}
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="food-image"
                />
                <span className="food-name">{food.name}</span>
              </button>
              <div className="food-difficulty-label">{food.difficulty}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
