import { Cup, InputState, FoodType } from "../types";
import { ObjectPool } from "./ObjectPool";
import { PhysicsEngine } from "./PhysicsEngine";
import { RenderEngine } from "./RenderEngine";
import { GameLogic } from "./GameLogic";
import { GameSettingsManager } from "../utils/GameSettings";
import { AssetManager } from "./AssetManager";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onGameEnd: (result: "win" | "lose") => void;

  // Game state
  private cup!: Cup;
  private isRunning = false;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private showLostMessage: boolean = false;
  private lostMessageTimer: number = 0;

  // Modular components
  private objectPool: ObjectPool;
  private physicsEngine: PhysicsEngine;
  private renderEngine: RenderEngine;
  private gameLogic: GameLogic;
  private assets: AssetManager;
  private selectedFood: FoodType | null = null;
  private onTargetItemCountChange?: (count: number) => void;

  // Object dimensions
  private cupWidth = 128;
  private cupHeight = 160;

  // Performance tracking
  private fps = 0;
  private frameCount = 0;
  private lastFpsUpdate = 0;

  // Performance optimizations
  // private frameSkipThreshold = 16.67; // Skip frames if delta > 16.67ms (60fps)

  constructor(
    canvas: HTMLCanvasElement,
    onGameEnd: (result: "win" | "lose") => void,
    onItemCountChange: (count: number) => void,
    onLivesChange: (lives: number) => void,
    selectedFood?: FoodType | null,
    onMaxLivesReached?: () => void,
    onTargetItemCountChange?: (count: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.onGameEnd = onGameEnd;
    this.onTargetItemCountChange = onTargetItemCountChange;

    // Initialize modular components
    this.objectPool = new ObjectPool(10); // Reduced pool size for better performance
    this.physicsEngine = new PhysicsEngine();
    this.assets = new AssetManager();
    this.renderEngine = new RenderEngine(canvas, this.assets);
    this.gameLogic = new GameLogic(
      this.objectPool,
      this.physicsEngine,
      onItemCountChange,
      onLivesChange,
      onGameEnd,
      onMaxLivesReached,
      this.handleBlastEffect.bind(this) // Pass blast effect handler
    );
    this.selectedFood = selectedFood ?? null;

    this.setupCanvas();
    this.initializeCup();
    this.setDifficultySpeed();
    this.gameLogic.setTargetItemCount(this.selectedFood);
  }

  private handleBlastEffect(x: number, y: number) {
    // Show "You Lost!" message
    this.showLostMessage = true;
    this.lostMessageTimer = performance.now();
    
    // Add blast to game logic for rendering
    // The blast will be handled in the render method
    console.log(`Bomb blast at position: ${x}, ${y}`);
  }

  private setupCanvas() {
    this.renderEngine.resize();
  }

  private initializeCup() {
    // Use display dimensions, not high-DPI canvas dimensions
    const rect = this.canvas.getBoundingClientRect();
    this.cup = {
      x: (rect.width - this.cupWidth) / 2,
      y: rect.height - this.cupHeight - 20,
      width: this.cupWidth,
      height: this.cupHeight,
    };
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.gameLogic.start();

    // Preload all assets before starting game loop
    await this.assets.preloadAll();

    this.gameLoop(0);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public restart() {
    this.isRunning = true;
    this.lastTime = 0;
    this.gameLogic.start();
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.setDifficultySpeed();
    this.gameLoop(0);
  }

  public updateInput(input: InputState) {
    if (!this.isRunning) return;

    this.gameLogic.updateCupPosition(this.cup, input);
    // Remove needsRender flag - always render for smooth gameplay
  }

  public updateSelectedFood(food: FoodType | null) {
    this.selectedFood = food;
    this.setDifficultySpeed();
    this.gameLogic.setTargetItemCount(food);
  }

  public resize() {
    this.setupCanvas();
    this.initializeCup();
  }

  private gameLoop(currentTime: number) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Simple, smooth game loop
    this.updateFPS(currentTime);
    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame((time) =>
      this.gameLoop(time)
    );
  }

  private updateFPS(currentTime: number) {
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
  }

  private update(deltaTime: number) {
    const result = this.gameLogic.update(deltaTime, this.cup);

    if (result.gameEnded) {
      this.endGame();
      return;
    }

    // Removed needsRender optimization for smoother gameplay
  }

  private render() {
    this.renderEngine.clear();
    this.renderEngine.drawBackground();

    const fallingObjects = this.gameLogic.getFallingObjects();
    this.renderEngine.drawFallingObjects(fallingObjects, this.selectedFood);

    this.renderEngine.drawCupWithImage(this.cup, this.selectedFood);
    this.renderEngine.drawCupFill(this.cup, this.gameLogic.getItemCount());

    // Draw blast effects
    this.renderEngine.drawBlastEffects(this.gameLogic.getActiveBlasts());

    // Draw "You Lost!" message if bomb was hit
    if (this.showLostMessage) {
      const elapsed = performance.now() - this.lostMessageTimer;
      if (elapsed < 2000) { // Show for 2 seconds
        const opacity = Math.max(0, 1 - (elapsed / 2000));
        const scale = 1 + (elapsed / 1000) * 0.5; // Scale up over time
        
        this.ctx.save();
        this.ctx.font = "bold 48px Orbitron";
        this.ctx.fillStyle = `rgba(231, 76, 60, ${opacity})`;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        
        const text = "YOU LOST!";
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        this.ctx.strokeText(text, 0, 0);
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
        
        this.ctx.restore();
      } else {
        this.showLostMessage = false;
      }
    }

    // FPS display (if enabled)
    const settings = GameSettingsManager.getSettings();
    if (settings.showFPS) {
      this.renderEngine.drawFPS(this.fps);
    }
  }

  private endGame() {
    const itemCount = this.gameLogic.getItemCount();
    const targetItemCount = this.gameLogic.getTargetItemCount();
    const result = itemCount >= targetItemCount ? "win" : "lose";
    console.log(
      `EndGame: itemCount=${itemCount}, target=${targetItemCount}, result=${result}`
    );

    // Record game statistics
    const gameTime = this.gameLogic.getGameTime();
    GameSettingsManager.recordGameResult(itemCount, gameTime);

    if (result === "win") {
      GameSettingsManager.updateHighScore(itemCount);
    }

    this.stop();
    this.onGameEnd(result);
  }

  public getItemCount(): number {
    return this.gameLogic.getItemCount();
  }

  public getMissedItems(): number {
    return this.gameLogic.getMissedItems();
  }

  public getTotalItemsSpawned(): number {
    return this.gameLogic.getTotalItemsSpawned();
  }

  public getMissPercentage(): number {
    return this.gameLogic.getMissPercentage();
  }

  public get running(): boolean {
    return this.isRunning;
  }

  private setDifficultySpeed() {
    let speedMultiplier = 0.8; // Reduced from 1.2 - easier base speed
    let targetItemCount = 10; // Default for shawarma (Easy)

    switch (this.selectedFood) {
      case "shawarma":
        speedMultiplier = 0.8; // Easy - slower speed
        targetItemCount = 10; // Easy
        break;
      case "milkshake":
        speedMultiplier = 1.0; // Medium - slightly faster than easy
        targetItemCount = 20; // Medium
        break;
      case "laptop":
        speedMultiplier = 1.2; // Hard - faster but still manageable
        targetItemCount = 40; // Hard
        break;
      default:
        speedMultiplier = 0.8;
        targetItemCount = 10;
        break;
    }

    this.physicsEngine.setSpeedMultiplier(speedMultiplier);
    this.physicsEngine.setSpawnFrequencyMultiplier(1.0); // Normal spawn frequency (reduced from 1.2)
    this.gameLogic.setTargetItemCount(this.selectedFood);
    this.onTargetItemCountChange?.(targetItemCount);
  }

  public destroy() {
    this.stop();
    this.objectPool.destroy();
  }
}
