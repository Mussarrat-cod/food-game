import { FallingObject, Cup, FoodType } from "../types";
import { AssetManager } from "./AssetManager";

export class RenderEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private assets: AssetManager;

  // Simple rendering state
  private imageSmoothingSet = false;

  constructor(canvas: HTMLCanvasElement, assets: AssetManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.assets = assets;
    this.setupCanvas();
  }

  private setupCanvas() {
    // Disable image smoothing for crisp pixel art assets
    this.ctx.imageSmoothingEnabled = false;
    this.imageSmoothingSet = true;

    // Set up high-DPI rendering
    this.setupHighDPICanvas();
  }

  private setupHighDPICanvas() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    // Set the actual canvas size in memory (scaled up for high DPI)
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;

    // Scale the canvas back down using CSS
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";

    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    // Ensure image smoothing is disabled for crisp rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = "high";
  }

  resize() {
    // Use the high-DPI setup for proper scaling
    this.setupHighDPICanvas();
  }

  clear() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  drawBackground() {
    // Simple, direct background drawing with white
    this.ctx.fillStyle = "#FFFFFF";
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.fillRect(0, 0, rect.width, rect.height);
  }

  drawFallingObjects(objects: FallingObject[], selectedFood: FoodType | null = null) {
    // Simple, direct rendering for smooth gameplay
    objects.forEach((obj) => {
      if (obj.type === "good") {
        const img = selectedFood ? this.assets.getGoodItemImage(selectedFood) : this.assets.getItemImage("chicken");
        if (img) {
          this.drawImage(img, obj.x, obj.y, obj.width, obj.height);
        } else {
          this.drawGoodItem(obj);
        }
      } else if (obj.type === "bad") {
        const img = this.assets.getItemImage("bomb");
        if (img) {
          this.drawImage(img, obj.x, obj.y, obj.width, obj.height);
        } else {
          this.drawBomb(obj);
        }
      } else if (obj.type === "heart") {
        const img = this.assets.getItemImage("heart");
        if (img) {
          this.drawImage(img, obj.x, obj.y, obj.width, obj.height);
        } else {
          this.drawHeart(obj);
        }
      }
    });
  }

  drawCupWithImage(cup: Cup, selectedFood: FoodType | null) {
    if (selectedFood) {
      const img = this.assets.getFoodImage(selectedFood);
      if (img) {
        this.drawImage(img, cup.x, cup.y, cup.width, cup.height);
        return;
      }
    }
    this.drawCup(cup);
  }

  private drawGoodItem(obj: FallingObject) {
    this.ctx.fillStyle = "#8B4513"; // Brown for chicken
    this.ctx.beginPath();
    this.ctx.arc(
      obj.x + obj.width / 2,
      obj.y + obj.height / 2,
      obj.width / 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  private drawBomb(obj: FallingObject) {
    this.ctx.fillStyle = "#FF0000"; // Red for bomb
    this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }

  private drawHeart(obj: FallingObject) {
    // Draw a simple heart shape
    this.ctx.fillStyle = "#FF69B4"; // Pink for heart
    this.ctx.beginPath();

    const centerX = obj.x + obj.width / 2;
    const centerY = obj.y + obj.height / 2;
    const radius = obj.width / 4;

    // Draw heart shape using two circles and a triangle
    this.ctx.arc(
      centerX - radius / 2,
      centerY - radius / 2,
      radius,
      0,
      2 * Math.PI
    );
    this.ctx.arc(
      centerX + radius / 2,
      centerY - radius / 2,
      radius,
      0,
      2 * Math.PI
    );
    this.ctx.fill();

    // Draw triangle for bottom of heart
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY + radius);
    this.ctx.lineTo(centerX - radius, centerY);
    this.ctx.lineTo(centerX + radius, centerY);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Ensure image smoothing is disabled for crisp pixel art
    if (!this.imageSmoothingSet) {
      this.ctx.imageSmoothingEnabled = false;
      this.imageSmoothingSet = true;
    }

    // Round coordinates to prevent sub-pixel rendering
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    const roundedW = Math.round(w);
    const roundedH = Math.round(h);

    this.ctx.drawImage(img, roundedX, roundedY, roundedW, roundedH);
  }

  drawCup(cup: Cup) {
    // Draw cup body with rounded coordinates
    this.ctx.fillStyle = "#8B4513"; // Brown color for cup
    this.ctx.fillRect(
      Math.round(cup.x),
      Math.round(cup.y),
      Math.round(cup.width),
      Math.round(cup.height)
    );

    // Draw cup border
    this.ctx.strokeStyle = "#654321";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      Math.round(cup.x),
      Math.round(cup.y),
      Math.round(cup.width),
      Math.round(cup.height)
    );
  }

  drawCupFill(cup: Cup, itemCount: number) {
    if (itemCount > 0) {
      // Use group images progressively
      // 1st item: show first overlay (1.PNG)
      // 2nd item: show Group 1
      // 3rd item: show Group 3
      // 4th item: show Group 4
      // ...and so on

      let imageToUse: HTMLImageElement | null = null;

      if (itemCount === 1) {
        // First item: use overlay image
        imageToUse = this.assets.getOverlayImage(0); // 1.PNG
      } else {
        // Map item count to available group images
        // 2 items -> Group 1 (index 0)
        // 3 items -> Group 3 (index 2)
        // 4 items -> Group 4 (index 3)
        // etc.
        // For 10+ items, show the maximum overlay (Group 9, which is for 10 items)
        let groupIndex: number;
        if (itemCount === 2) {
          groupIndex = 0; // Group 1
        } else if (itemCount >= 3) {
          // Cap at 10 items for the overlay (Group 9 is the last available)
          const cappedCount = Math.min(itemCount, 10);
          groupIndex = cappedCount - 1; // Group 3, 4, 5, etc., capped at Group 9
        } else {
          groupIndex = -1; // Invalid
        }

        if (groupIndex >= 0) {
          imageToUse = this.assets.getGroupImage(groupIndex);
        }
      }

      if (imageToUse && imageToUse.naturalWidth > 0) {
        // Draw the group/overlay image showing the cup with the correct number of items
        this.drawImage(imageToUse, cup.x, cup.y, cup.width, cup.height);
      } else {
        // Fallback: draw individual items if overlay not loaded
        const itemImg = this.assets.getItemFillImage();
        const itemSize = 10;
        const margin = 24;
        const innerWidth = cup.width - margin * 2;
        const itemsPerRow = Math.floor(innerWidth / (itemSize + 2));
        const startY = cup.y + cup.height - margin - itemSize;

        for (let i = 0; i < itemCount; i++) {
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const x = cup.x + margin + col * (itemSize + 2);
          const y = startY - row * (itemSize + 2);

          if (itemImg && itemImg.naturalWidth > 0) {
            this.drawImage(itemImg, x, y, itemSize, itemSize);
          } else {
            this.ctx.fillStyle = "#8B4513";
            this.ctx.beginPath();
            this.ctx.arc(
              x + itemSize / 2,
              y + itemSize / 2,
              itemSize / 2,
              0,
              2 * Math.PI
            );
            this.ctx.fill();
          }
        }
      }
    }
  }

  drawFPS(fps: number) {
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "16px monospace";
    this.ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 30);
  }

  drawBlastEffects(blasts: Array<{x: number, y: number, time: number, radius: number}>) {
    if (blasts.length > 0) {
      console.log(`🎨 Drawing ${blasts.length} blast effects`);
    }
    
    const currentTime = performance.now();
    
    blasts.forEach(blast => {
      const age = currentTime - blast.time;
      const maxAge = 1500; // 1.5 second animation
      const progress = age / maxAge;
      
      if (progress < 1) {
        const opacity = 1 - progress;
        const currentRadius = blast.radius * (1 + progress * 3); // Much bigger expansion
        
        // Draw a HUGE red circle as test
        this.ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(blast.x, blast.y, currentRadius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ORANGE EXPLOSION - simplified and more visible
        // Outer explosion ring - much bigger and more visible
        this.ctx.strokeStyle = `rgba(255, 165, 0, ${opacity})`; // Bright orange
        this.ctx.lineWidth = 12; // Thicker lines
        this.ctx.beginPath();
        this.ctx.arc(blast.x, blast.y, currentRadius * 1.5, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Middle explosion ring
        this.ctx.strokeStyle = `rgba(255, 200, 0, ${opacity})`; // Yellow-orange
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.arc(blast.x, blast.y, currentRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Inner explosion ring
        this.ctx.strokeStyle = `rgba(255, 255, 0, ${opacity})`; // Bright yellow
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.arc(blast.x, blast.y, currentRadius * 0.6, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Center flash - bigger and brighter
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`; // White center
        this.ctx.beginPath();
        this.ctx.arc(blast.x, blast.y, currentRadius * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Explosion particles - more particles and bigger
        for (let i = 0; i < 16; i++) {
          const angle = (Math.PI * 2 * i) / 16;
          const distance = currentRadius * (1 + progress * 2);
          const px = blast.x + Math.cos(angle) * distance;
          const py = blast.y + Math.sin(angle) * distance;
          const particleSize = 8 * (1 - progress * 0.3);
          
          this.ctx.fillStyle = `rgba(255, 140, 0, ${opacity})`; // Orange particles
          this.ctx.beginPath();
          this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });
  }
}
