import { FoodType } from "../types";

type ImageRecord = Record<string, HTMLImageElement>;

export class AssetManager {
  private itemImages: ImageRecord = {};
  private foodImages: ImageRecord = {};
  private overlayImages: HTMLImageElement[] = [];
  private groupImages: HTMLImageElement[] = [];
  private itemImage: HTMLImageElement | null = null;
  private failedKeys: Set<string> = new Set();

  private loadImage(key: string, src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();

      // Ensure images are loaded at full resolution
      img.crossOrigin = "anonymous";
      img.decoding = "async";

      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(
          `[assets] Failed to load image for key="${key}" from ${src}`
        );
        this.failedKeys.add(key);
        resolve(img); // resolve anyway; callers will detect naturalWidth === 0
      };
    });
  }

  async preloadAll(): Promise<void> {
    // Load critical assets first (items and cup overlays)
    const criticalAssets: Array<
      [string, string, (img: HTMLImageElement) => void]
    > = [
      [
        "items:chicken",
        "/assets/chicken.png",
        (img: HTMLImageElement) => (this.itemImages["chicken"] = img),
      ],
      [
        "items:ice",
        "/assets/ice.png",
        (img: HTMLImageElement) => (this.itemImages["ice"] = img),
      ],
      [
        "items:battery",
        "/assets/battery.png",
        (img: HTMLImageElement) => (this.itemImages["battery"] = img),
      ],
      [
        "items:bomb",
        "/assets/bomb.png",
        (img: HTMLImageElement) => (this.itemImages["bomb"] = img),
      ],
      [
        "items:heart",
        "/assets/pixelheart.png",
        (img: HTMLImageElement) => (this.itemImages["heart"] = img),
      ],
    ];

    // Load cup overlay images (1-10 pearls)
    for (let i = 1; i <= 10; i++) {
      criticalAssets.push([
        `overlays:${i}`,
        `/assets/${i}.PNG`,
        (img: HTMLImageElement) => (this.overlayImages[i - 1] = img),
      ]);
    }

    // Load group images (Group 1, 3-10) - using PNG for transparency
    // Note: Group 2.png doesn't exist, so we skip it
    const groupIndices = [1, 3, 4, 5, 6, 7, 8, 9, 10];
    for (const i of groupIndices) {
      criticalAssets.push([
        `groups:${i}`,
        `/assets/Group ${i}.png`,
        (img: HTMLImageElement) => {
          this.groupImages[i - 1] = img;
        },
      ]);
    }

    await Promise.all(
      criticalAssets.map(async ([key, src, assign]) => {
        const img = await this.loadImage(key, src);
        assign(img);
      })
    );

    // Load other assets in parallel without blocking
    const otherAssets: Array<
      [string, string, (img: HTMLImageElement) => void]
    > = [
      [
        "foods:shawarma",
        "/assets/shawarma.png",
        (img: HTMLImageElement) => (this.foodImages["shawarma"] = img),
      ],
      [
        "foods:milkshake",
        "/assets/milkshake.png",
        (img: HTMLImageElement) => (this.foodImages["milkshake"] = img),
      ],
      [
        "foods:laptop",
        "/assets/laptop.png",
        (img: HTMLImageElement) => (this.foodImages["laptop"] = img),
      ],
    ];

    // Don't await these - let them load in background
    Promise.all(
      otherAssets.map(async ([key, src, assign]) => {
        const img = await this.loadImage(key, src);
        assign(img);
      })
    );

    // Load item image for cup fill (background loading)
    this.loadImage("item", "/assets/pixelheart.png").then((img) => {
      this.itemImage = img;
    });
  }

  getItemImage(kind: "chicken" | "ice" | "battery" | "bomb" | "heart"): HTMLImageElement | null {
    const img = this.itemImages[kind];
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) return null;
    return img;
  }

  // Method to get the correct item type based on selected food
  getGoodItemImage(foodType: FoodType): HTMLImageElement | null {
    switch (foodType) {
      case "shawarma":
        return this.getItemImage("chicken");
      case "milkshake":
        return this.getItemImage("ice");
      case "laptop":
        return this.getItemImage("battery");
      default:
        return this.getItemImage("chicken");
    }
  }

  getFoodImage(food: FoodType): HTMLImageElement | null {
    const img = this.foodImages[food];
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) return null;
    return img;
  }

  hasFailed(key: string): boolean {
    return this.failedKeys.has(key);
  }

  getOverlayImage(index: number): HTMLImageElement | null {
    if (index < 0 || index >= this.overlayImages.length) return null;
    const img = this.overlayImages[index];
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) return null;
    return img;
  }

  getItemFillImage(): HTMLImageElement | null {
    if (
      !this.itemImage ||
      this.itemImage.naturalWidth === 0 ||
      this.itemImage.naturalHeight === 0
    )
      return null;
    return this.itemImage;
  }

  getGroupImage(index: number): HTMLImageElement | null {
    if (index < 0 || index >= this.groupImages.length) {
      return null;
    }
    const img = this.groupImages[index];
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) {
      return null;
    }
    return img;
  }
}
