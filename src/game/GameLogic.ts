import { FallingObject, Cup, FoodType } from "../types";
import { ObjectPool } from "./ObjectPool";
import { PhysicsEngine } from "./PhysicsEngine";

export class GameLogic {
  private readonly CUP_SPEED = 400; // pixels per second
  private targetItemCount = 10; // Default for shawarma (Easy)

  private itemCount = 0;
  private lastItemCount = 0;
  private gameStartTime = 0;
  private gameTime = 0;
  private lives = 3;
  private currentFoodType: FoodType | null = null;
  private speedBoostApplied = false;
  private hardDifficultySpeedBoosts = 0; // Track how many speed boosts have been applied for hard difficulty
  
  // Track missed items for 50% rule
  private totalItemsSpawned = 0;
  private itemsMissed = 0;
  
  // Blast effect system
  private activeBlasts: Array<{x: number, y: number, time: number, radius: number}> = [];

  constructor(
    private objectPool: ObjectPool,
    private physicsEngine: PhysicsEngine,
    private onItemCountChange: (count: number) => void,
    private onLivesChange: (lives: number) => void,
    private onGameEnd: (result: "win" | "lose") => void,
    private onMaxLivesReached?: () => void,
    private onBlastEffect?: (x: number, y: number) => void
  ) {}

  start() {
    this.itemCount = 0;
    this.lastItemCount = 0;
    this.gameStartTime = performance.now();
    this.gameTime = 0;
    this.lives = 3;
    this.speedBoostApplied = false;
    this.hardDifficultySpeedBoosts = 0;
    this.totalItemsSpawned = 0;
    this.itemsMissed = 0;
    this.objectPool.returnAllObjects();
    this.onItemCountChange(0);
    this.onLivesChange(3);
  }

  update(
    deltaTime: number,
    cup: Cup
  ): { needsRender: boolean; gameEnded: boolean } {
    this.gameTime = performance.now() - this.gameStartTime;
    let gameEnded = false;

    // Clean up old blasts (older than 2 seconds)
    const currentTime = performance.now();
    this.activeBlasts = this.activeBlasts.filter(b => currentTime - b.time < 2000);

    // Update physics
    const fallingObjects = this.objectPool.getActiveObjects();
    this.physicsEngine.update(deltaTime, fallingObjects);

    // Check for new object spawn
    if (this.physicsEngine.shouldSpawnObject(deltaTime)) {
      this.spawnObject();
    }

    // Check collisions - iterate backwards for safe removal
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
      const obj = fallingObjects[i];

      if (this.physicsEngine.checkCollision(obj, cup)) {
        if (obj.type === "good") {
          this.handleGoodItemCollision();
        } else if (obj.type === "bad") {
          console.log(
            `Bomb collision! Lives before: ${this.lives}, Item count: ${this.itemCount}`
          );
          this.handleBadItemCollision();
          gameEnded = true; // Bomb collision immediately ends the game
          console.log(
            `Game ended due to bomb collision. Lives after: ${this.lives}`
          );
          break;
        } else if (obj.type === "heart") {
          this.handleHeartCollision();
        }

        // Remove object after collision
        this.objectPool.returnObject(obj);
      }
    }

    // Remove off-screen objects and track missed good items
    const canvas = document.querySelector("canvas");
    const canvasHeight = canvas
      ? canvas.getBoundingClientRect().height
      : window.innerHeight;
    const threshold = canvasHeight + 100;

    // Get a fresh snapshot after collision handling
    const remainingObjects = this.objectPool.getActiveObjects();
    for (let i = 0; i < remainingObjects.length; i++) {
      const obj = remainingObjects[i];
      if (obj.y > threshold) {
        if (obj.type === "good") {
          // Track missed good items
          this.itemsMissed++;
          console.log(`Missed item! Total missed: ${this.itemsMissed}/${this.totalItemsSpawned}`);
          
          // Check if 50% of items have been missed
          if (this.totalItemsSpawned > 0 && (this.itemsMissed / this.totalItemsSpawned) >= 0.5) {
            console.log(`Game ended! Missed 50% of items: ${this.itemsMissed}/${this.totalItemsSpawned}`);
            gameEnded = true;
            this.onGameEnd("lose");
            break;
          }
        }
        // Always return off-screen objects to the pool
        this.objectPool.returnObject(obj);
        if (gameEnded) break;
      }
    }

    // Check win condition only if game hasn't ended
    console.log(
      `End of update: gameEnded=${gameEnded}, itemCount=${this.itemCount}, target=${this.targetItemCount}, lives=${this.lives}`
    );

    if (!gameEnded && this.itemCount >= this.targetItemCount) {
      console.log(
        `Game won! Item count: ${this.itemCount}, Target: ${this.targetItemCount}, Food: ${this.currentFoodType}`
      );
      gameEnded = true;
      this.onGameEnd("win");
    } else if (gameEnded && this.lives <= 0) {
      // Game ended due to bomb collision or other lose condition
      console.log(
        `Game lost! Lives: ${this.lives}, Item count: ${this.itemCount}`
      );
      this.onGameEnd("lose");
    }

    return { needsRender: false, gameEnded };
  }

  private spawnObject() {
    const obj = this.objectPool.getObject();
    const canvas = document.querySelector("canvas");
    const canvasWidth = canvas
      ? canvas.getBoundingClientRect().width
      : window.innerWidth;
    const objectData = this.physicsEngine.generateObject(canvasWidth, 64);

    // Only count good items for the 50% rule
    if (objectData.type === "good") {
      this.totalItemsSpawned++;
    }

    Object.assign(obj, objectData, {
      width: 64,
      height: 64,
    });
  }

  private handleGoodItemCollision() {
    this.itemCount++;
    console.log(
      `Item collected! New count: ${this.itemCount}, Target: ${this.targetItemCount}`
    );

    if (this.itemCount !== this.lastItemCount) {
      this.lastItemCount = this.itemCount;
      this.onItemCountChange(this.itemCount);
    }

    // Check for speed boost on medium difficulty at 10 items
    if (
      this.currentFoodType === "milkshake" &&
      this.itemCount === 10 &&
      !this.speedBoostApplied
    ) {
      this.physicsEngine.increaseSpeedMultiplier(0.1); // 10% speed increase on top of 20% harder base
      this.physicsEngine.increaseSpawnFrequencyMultiplier(0.1); // 10% item frequency increase on top of 20% harder base
      this.speedBoostApplied = true;
    }

    // Check for progressive speed and frequency boosts on hard difficulty
    if (this.currentFoodType === "laptop") {
      if (this.itemCount === 10 && this.hardDifficultySpeedBoosts === 0) {
        this.physicsEngine.increaseSpeedMultiplier(0.1); // 10% speed increase on top of 20% harder base
        this.physicsEngine.increaseSpawnFrequencyMultiplier(0.1); // 10% item frequency increase on top of 20% harder base
        this.hardDifficultySpeedBoosts = 1;
      } else if (
        this.itemCount === 20 &&
        this.hardDifficultySpeedBoosts === 1
      ) {
        this.physicsEngine.increaseSpeedMultiplier(0.2); // 20% speed increase on top of 20% harder base
        this.physicsEngine.increaseSpawnFrequencyMultiplier(0.05); // 5% item frequency increase on top of 20% harder base
        this.hardDifficultySpeedBoosts = 2;
      } else if (
        this.itemCount === 30 &&
        this.hardDifficultySpeedBoosts === 2
      ) {
        this.physicsEngine.increaseSpeedMultiplier(0.2); // 20% speed increase on top of 20% harder base
        this.physicsEngine.increaseSpawnFrequencyMultiplier(0.05); // 5% item frequency increase on top of 20% harder base
        this.hardDifficultySpeedBoosts = 3;
      }
    }

    // Win condition will be checked in the main update method
  }

  private handleBadItemCollision() {
    console.log("🔥 BOMB COLLISION DETECTED! Creating blast effect...");
    
    // Trigger blast effect at bomb position
    const fallingObjects = this.objectPool.getActiveObjects();
    const bombObj = fallingObjects.find(obj => obj.type === "bad");
    if (bombObj && this.onBlastEffect) {
      console.log("📍 Bomb found at:", bombObj.x, bombObj.y);
      
      // Store blast data for rendering
      const blast = {
        x: bombObj.x + bombObj.width / 2,
        y: bombObj.y + bombObj.height / 2,
        time: performance.now(),
        radius: 30
      };
      this.activeBlasts.push(blast);
      console.log("💥 Blast added to activeBlasts:", this.activeBlasts.length);
      
      // Trigger the visual effect
      this.onBlastEffect(blast.x, blast.y);
      
      // Clean up old blasts (older than 2 seconds)
      const currentTime = performance.now();
      this.activeBlasts = this.activeBlasts.filter(b => currentTime - b.time < 2000);
    } else {
      console.log("❌ No bomb object or no blast effect handler found");
    }
    
    // Bombs now cause instant death regardless of remaining lives
    this.lives = 0;
    this.onLivesChange(this.lives);
    // Game end will be handled by the main update method
  }

  private handleHeartCollision() {
    // Add a life, but cap at maximum of 3 lives
    if (this.lives < 3) {
      this.lives = Math.min(this.lives + 1, 3);
      this.onLivesChange(this.lives);
    } else {
      // Player already has max lives, trigger animation
      this.onMaxLivesReached?.();
    }
  }

  getItemCount(): number {
    return this.itemCount;
  }

  getGameTime(): number {
    return this.gameTime;
  }

  getFallingObjects(): FallingObject[] {
    return this.objectPool.getActiveObjects();
  }

  getLives(): number {
    return this.lives;
  }

  setTargetItemCount(foodType: FoodType | null): void {
    this.currentFoodType = foodType;
    this.speedBoostApplied = false; // Reset speed boost when food changes
    this.hardDifficultySpeedBoosts = 0; // Reset hard difficulty speed boosts

    switch (foodType) {
      case "shawarma":
        this.targetItemCount = 10; // Easy
        break;
      case "milkshake":
        this.targetItemCount = 20; // Medium
        break;
      case "laptop":
        this.targetItemCount = 40; // Hard
        break;
      default:
        this.targetItemCount = 10; // Default to easy
        break;
    }

    console.log(
      `Target item count set to: ${this.targetItemCount} for food: ${foodType}`
    );
  }

  getTargetItemCount(): number {
    return this.targetItemCount;
  }

  getMissedItems(): number {
    return this.itemsMissed;
  }

  getTotalItemsSpawned(): number {
    return this.totalItemsSpawned;
  }

  getMissPercentage(): number {
    if (this.totalItemsSpawned === 0) return 0;
    return Math.round((this.itemsMissed / this.totalItemsSpawned) * 100);
  }

  getActiveBlasts(): Array<{x: number, y: number, time: number, radius: number}> {
    return this.activeBlasts;
  }

  updateCupPosition(
    cup: Cup,
    input: { left: boolean; right: boolean; mouseX?: number }
  ) {
    if (input.mouseX !== undefined) {
      cup.x = input.mouseX - cup.width / 2;
    } else {
      const speed = (this.CUP_SPEED * 16.67) / 1000; // 16.67ms frame time
      if (input.left) {
        cup.x -= speed;
      }
      if (input.right) {
        cup.x += speed;
      }
    }

    // Clamp cup position to canvas bounds
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      cup.x = Math.max(0, Math.min(rect.width - cup.width, cup.x));
    }
  }
}
