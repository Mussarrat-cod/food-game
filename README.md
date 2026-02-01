# Food Drop Game 🍴💻

An exciting catch-the-food game featuring your favorite items! Catch shawarma, milkshake, and laptop while avoiding bombs. Built with React, TypeScript, and Vite for smooth gameplay.

![Game Preview](https://img.shields.io/badge/Game-Food%20Drop-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.8-orange)

## 🌟 Featured Food Items

### 🥙 Shawarma
The ultimate Middle Eastern wrap! Catch delicious shawarma pieces to fill your cup and score points.


### 🥤 Milkshake
Thick, creamy, and refreshing! Collect milkshakes for maximum satisfaction.

### 💻 Laptop
Power up your game with tech energy! Laptops give you special boosts in the game.


## 🚀 Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mussarrat-cod/food-game.git
cd food-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173

## 🎮 How to Play

1. **Start Screen**: Choose your favorite food item
2. **Game Screen**:
   - Use arrow keys (←/→) or A/D keys to move your cup
   - Touch and drag on mobile devices
   - Catch shawarma, milkshake, and laptop (good!)
   - Avoid bombs (bad!)
   - Fill your cup with 10 items to win
3. **Result Screen**: See if you won or lost, then play again!

## 🍴 Complete Food Menu

### Main Attractions:
- 🥙 **Shawarma** - Middle Eastern wrap specialty
- 🥤 **Milkshake** - Creamy and delicious
- 💻 **Laptop** - Tech power-up item

### Other Food Items:
- 🍗 **Chicken** - Grilled chicken pieces
- 🧊 **Ice** - Cooling ice cubes
- 🔋 **Battery** - Power up your game
- ❤️ **Pixel Heart** - Extra lives

### Special Items:
- 💣 **Bomb** - Avoid these at all costs!
- Numbers 1-10 for scoring and levels

## ✨ Game Features

### Core Gameplay:
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Canvas-based Rendering**: Smooth 60fps animations
- **Multiple Control Schemes**: Touch and keyboard controls
- **Visual Feedback**: Watch your cup fill as you collect food
- **Progressive Difficulty**: Game speeds up as you progress

### Technical Features:
- **Adaptive Layout**: Automatic window resize handling
- **High DPI Support**: Crisp graphics on retina displays
- **Object Pooling**: Optimized performance for many falling items
- **Fixed Delta Time**: Consistent physics across devices
- **Collision Detection**: Precise cup boundary detection

### Asset Management:
- **Relative Paths**: All assets use `./assets/` paths
- **Preloading System**: Efficient asset loading
- **Fallback Support**: Graceful handling of missing assets
- **High-Resolution Graphics**: Crisp visuals on all displays

## 🎨 Assets Directory

All game assets are organized in `./assets/`:

```
assets/
├── shawarma.png      # 🥙 Main featured item
├── milkshake.png     # 🥤 Main featured item  
├── laptop.png        # 💻 Main featured item
├── boba.png          # 🧋 Classic boba
├── milk_tea.png      # 🥛 Milk tea
├── matcha.png        # 🍵 Matcha green tea
├── taro.png          # 🍹 Taro drink
├── chicken.png       # 🍗 Chicken pieces
├── ice.png           # 🧊 Ice cubes
├── battery.png       # 🔋 Battery power-up
├── pixelheart.png    # ❤️ Heart extra life
├── bomb.png          # 💣 Bomb (avoid!)
├── 1.png - 10.png    # Number items for scoring
└── Group 1.png - Group 10.png  # Grouped items
```

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5.0.8 for fast development
- **Game Engine**: Custom HTML5 Canvas engine
- **Asset Management**: Optimized loading system
- **Physics Engine**: Custom collision detection
- **Styling**: CSS with responsive design
- **Linting**: ESLint with TypeScript rules

## 🏗️ Project Architecture

```
src/
├── components/          # React UI components
├── context/            # React Context for game state
├── game/              # Core game engine
│   ├── AssetManager.ts # Asset loading system
│   ├── GameLogic.ts   # Game mechanics
│   ├── ObjectPool.ts  # Performance optimization
│   ├── PhysicsEngine.ts # Collision detection
│   ├── RenderEngine.ts # Canvas rendering
│   ├── engine.ts      # Main game loop
│   └── input.ts       # Input handling
├── screens/           # Game screens
├── utils/             # Utility functions
└── types.ts           # TypeScript definitions
```

## 🎯 Game Mechanics

### Scoring System:
- **Shawarma**: +1 point, fills cup progress
- **Milkshake**: +1 point, fills cup progress  
- **Laptop**: +1 point, fills cup progress
- **Other Foods**: +1 point, fills cup progress
- **Bomb**: Game over, resets progress
- **Win Condition**: Collect 10 food items

### Controls:
- **Desktop**: Arrow keys (←/→) or A/D keys
- **Mobile**: Touch and drag
- **Responsive**: Automatically adapts to device type

### Physics:
- Fixed delta time for consistent gameplay
- Gravity simulation for falling objects
- Collision detection with cup boundaries
- Smooth interpolation for movement

## 🐛 Troubleshooting

### Common Issues:

1. **Vite won't start**: 
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Images not loading**: Check that all paths in `./assets/` are correct

3. **Game not responsive**: Ensure browser supports Canvas API

4. **Performance issues**: Close unnecessary tabs, enable hardware acceleration

### Asset Loading Issues:
- Verify all images exist in `./assets/` directory
- Check file names match exactly (case-sensitive)
- Ensure relative paths use `./assets/` format

## 📝 Development

### Available Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality:
- TypeScript for type safety
- ESLint for code quality
- Component-based architecture
- Custom game engine with object pooling

## 🎮 Play Online



## 📄 License

This project is licensed under the MIT License.

---

**Catch that shawarma, milkshake, and laptop! 🎉**
