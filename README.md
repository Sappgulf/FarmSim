# 🌾 Advanced Farm Simulation Game

**Version: 2.1.0** *(Quality of Life & Expansion Update)*

A comprehensive React-based farm simulation game featuring advanced genetic breeding systems, dynamic weather mechanics, sophisticated agricultural management tools, and now enhanced with quality of life improvements, processing plants, hotkey controls, and interactive tutorials.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play!

## 🎮 Game Overview

Manage your own virtual farm with realistic agriculture mechanics. Plant crops, breed animals, research new technologies, and build advanced agricultural infrastructure. Features a complete genetic breeding system where you can crossbreed crops to create hybrid varieties with enhanced traits.

## ✨ Core Features

### 🎮 **Quality of Life Improvements** *(NEW)*
- **Interactive Tutorial System**: Step-by-step guidance for new players
- **Hotkey Controls**: Keyboard shortcuts for efficient farming (Space, W, F, H, B, G, etc.)
- **Bulk Action Mode**: Select multiple plots for batch watering/fertilizing
- **Quick Action Toolbar**: One-click access to common farming tasks
- **Auto-Save System**: Configurable automatic game saving every 30 seconds
- **Contextual Help**: Always-available hotkey reference and tutorial restart

### 🏭 **Processing Plants & Value-Added Agriculture** *(NEW)*
- **Grain Mill**: Transform wheat into flour (+50% value)
- **Juice Factory**: Process tomatoes into juice (+60% value) 
- **Corn Distillery**: Distill corn into ethanol (+80% value)
- **Preserving Plant**: Preserve carrots (+40% value)
- **Processing Queue**: Timed production with collection mechanics
- **Dedicated Processing Tab**: Centralized crop processing management

### 🌱 **Basic Farming**
- **9 Plot Farm Grid**: Expandable farming space with visual crop management
- **4 Base Crops**: Wheat, Carrots, Tomatoes, Corn with realistic growth cycles
- **Quality System**: Crop quality affects selling prices and breeding potential
- **Seasonal Mechanics**: 4 seasons affecting crop growth and market prices

### 🧬 **Advanced Genetic System** *(NEW)*
- **Crossbreeding**: Create hybrid crops by combining different varieties
- **Genetic Traits**: 
  - **Disease Resistance**: Reduces infection chances
  - **Fast Growth**: Shorter growth cycles
  - **High Value**: Increased crop worth
  - **Weather Resistant**: Protection from weather effects
- **Seed Quality Tiers**: Bronze → Silver → Gold → Platinum
- **Trait Inheritance**: Offspring inherit parent traits with variation
- **Hybrid Combinations**: 12 unique hybrid varieties available

### 🌦️ **Dynamic Weather System**
- **7 Weather Types**: Sunny, Rainy, Cloudy, Drought, Storm, Snow, Windy
- **Growth Multipliers**: Weather affects crop development speed
- **Disease Mechanics**: Weather influences blight and pest outbreak chances
- **Storm Damage**: Severe weather can damage unprotected crops
- **Weather Forecast**: 3-day advance weather prediction

### 🏗️ **Advanced Buildings & Technology**
- **Greenhouse**: Complete weather protection for crops
- **Irrigation System**: Drought resistance and growth boost
- **Automation Hub**: Auto-harvesting and crop management
- **Research Lab**: Unlock genetic modifications and breeding techniques
- **Barn**: Livestock housing with capacity bonuses
- **Silo**: Extended crop storage capabilities

### 🐄 **Livestock Management**
- **4 Animal Types**: Chickens, Cows, Pigs, Sheep
- **Feed System**: Different animals require specific feed types
- **Production Cycles**: Animals generate products over time
- **Barn Benefits**: Increased production rates when housed properly

### 🛒 **Enhanced Shop System**
- **Permanent Tools**: Watering Can, Harvester, Sprinkler, Premium Fertilizer
- **Consumable Items**: Fungicide (3 uses), Pesticide (3 uses)
- **Feed Supplies**: Grain, Hay, Corn Feed, Grass Pellets (10 portions each)
- **Bulk Seeds**: 20-seed packages for efficient planting
- **Smart Inventory**: Tracks consumable item quantities

### 🦠 **Disease & Treatment System**
- **3 Disease Types**: Crop Blight, Pest Infestation, Crop Stress
- **Treatment Mechanics**: Use fungicide/pesticide to cure diseases
- **Resistance Traits**: Genetic resistance reduces infection rates
- **Visual Indicators**: Diseased crops clearly marked for treatment

### 🎯 **Progression Systems**
- **Experience & Levels**: Gain XP from harvesting, unlock new features
- **Research Points**: Earned through gameplay, spent on technology upgrades
- **Achievement System**: 11 achievements with monetary rewards
- **Contract System**: Special delivery missions for bonus income

### 📊 **Market & Economy**
- **Dynamic Pricing**: Crop values fluctuate based on season and supply
- **Market Trends**: Strategic timing for maximum profit
- **Visitor System**: NPCs offer special deals and bonuses
- **Economic Tracking**: Comprehensive financial statistics

## 🧪 **Genetic Breeding Guide**

### Creating Hybrids
1. **Plant Parent Crops**: Grow two different crop types to maturity
2. **Access Breeding**: Use the Genetics tab in the game interface
3. **Select Parents**: Choose crops with desired traits
4. **Crossbreed**: Combine to create hybrid seeds
5. **Plant Hybrids**: New varieties with combined traits

### Available Hybrid Combinations
- **Wheat + Carrot** → Hardy Root (Fast Growth + Disease Resistance)
- **Tomato + Corn** → Golden Fruit (High Value + Weather Resistant)
- **Wheat + Tomato** → Garden Gold (Disease Resistance + High Value)
- **Carrot + Corn** → Super Grain (Fast Growth + Weather Resistant)
- *...and 8 more unique combinations!*

### Seed Quality Progression
- **Bronze** (1.0x) → **Silver** (1.2x) → **Gold** (1.5x) → **Platinum** (2.0x)
- Higher quality seeds produce more valuable crops
- Upgrade using research points and gold

## 🌦️ **Weather Strategy**

### Weather Effects on Crops
- **Sunny**: +20% growth, low disease risk
- **Rainy**: +10% growth, moderate blight risk  
- **Drought**: -30% growth, high stress risk
- **Storm**: -20% growth, potential crop damage
- **Snow**: -40% growth (winter crops only)

### Protection Strategies
- **Build Greenhouses**: Complete weather immunity
- **Install Irrigation**: Drought protection + growth boost
- **Breed Resistant Crops**: Genetic weather resistance
- **Monitor Forecasts**: Plan planting around weather

## 🏆 **Achievements**

| Achievement | Description | Reward |
|------------|-------------|---------|
| First Harvest | Harvest your first crop | $50 |
| Big Spender | Spend $500 total | $100 |
| Experienced Farmer | Reach level 5 | $200 |
| Master Farmer | Reach level 10 | $500 |
| Master Harvester | Complete 100 harvests | $500 |
| Millionaire | Earn $1000 total | $1000 |
| Animal Lover | Own 5 animals | $300 |
| Rancher | Own 10 animals | $600 |
| Architect | Build 3 different buildings | $400 |
| Researcher | Unlock all research | $800 |
| Farm Tycoon | Have $5000 at once | $2000 |

## 🛠️ **Technical Features**

### Save/Load System
- **Local Storage**: Automatic game state persistence
- **Complete State**: All progress, genetics, and buildings saved
- **Cross-Session**: Continue exactly where you left off

### Responsive Design
- **Mobile Optimized**: Touch-friendly interface for all devices
- **Adaptive Layout**: Scales from phone to desktop seamlessly
- **Tailwind CSS**: Modern, efficient styling system

### Performance
- **React Hooks**: Efficient state management
- **Vite Build System**: Fast development and production builds
- **Component Architecture**: Modular, maintainable code structure

## 🎯 **Game Tips**

### 🎮 **Hotkey Mastery**
- **Space**: Harvest all ready crops instantly
- **W**: Water all selected plots (bulk mode)
- **F**: Fertilize all selected plots (bulk mode)
- **B**: Toggle bulk selection mode
- **H**: Show/hide hotkey help overlay
- **G**: Quick switch to Genetics tab
- **S**: Manual save game
- **1-4**: Quick crop selection (wheat, carrot, tomato, corn)
- **ESC**: Clear plot selection

### 🏭 **Processing Strategy**
- **Build Early**: Processing plants provide significant profit boosts
- **Plan Production**: Time crop harvests with processing capacity
- **Value Calculation**: Higher quality crops = more valuable processed goods
- **Efficiency**: Process crops immediately after harvest for best returns

### 🧬 **Breeding & Genetics**
1. **Start Simple**: Focus on basic crops before advanced breeding
2. **Weather Planning**: Check forecasts before planting expensive seeds
3. **Build Protection**: Invest in greenhouses for consistent production
4. **Genetic Strategy**: Breed for traits that match your farming style
5. **Disease Prevention**: Stock up on treatments before outbreaks
6. **Market Timing**: Sell crops when seasonal prices are high
7. **Research Investment**: Unlock genetic improvements early
8. **Building Synergy**: Combine irrigation + greenhouse for maximum yields

### 🚀 **Efficiency Tips**
- **Use Bulk Mode**: Select multiple plots for batch operations
- **Learn Hotkeys**: Master keyboard shortcuts for 10x faster farming
- **Plan Layouts**: Group similar crops for easier management
- **Tutorial Review**: Restart tutorial anytime to learn new features
- **Processing Chain**: Build mills early for wheat value multiplication

## 📁 **Project Structure**

```
src/
├── components/
│   ├── SimpleFarmGame.jsx        # Main game component
│   ├── enhanced/                 # Advanced visual systems
│   ├── farm/                     # Core farming components  
│   ├── game/                     # UI and game mechanics
│   └── ui/                       # Reusable UI components
├── data/                         # Game data and configurations
├── hooks/                        # Custom React hooks
├── systems/                      # Game logic systems
└── utils/                        # Utility functions
```

## 🔧 **Development**

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run test` - Run test suite
- `npm run test:coverage` - Coverage report
- `npm run audit` - Full code audit

### Dependencies
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Vitest**: Testing framework

## 📈 **Version History**

### v2.1.0 - Quality of Life & Expansion Update *(Current)*
- ✅ Interactive tutorial system with step-by-step guidance
- ✅ Comprehensive hotkey system for efficient farming operations
- ✅ Bulk selection mode for multi-plot operations
- ✅ Quick action toolbar with one-click farming tasks
- ✅ Processing plants for value-added agriculture
- ✅ Grain mill, juice factory, distillery, and preserving plant
- ✅ Auto-save system with configurable intervals
- ✅ Enhanced UI with contextual help and hotkey reference
- ✅ Bulk watering/fertilizing of selected plots
- ✅ Processing tab for centralized crop transformation

### v2.0.0 - Advanced Genetics & Weather Update
- ✅ Complete genetic breeding system with trait inheritance
- ✅ Advanced weather mechanics with forecasting
- ✅ Building protection systems (greenhouses, irrigation)
- ✅ Seed quality progression (Bronze → Platinum)
- ✅ Hybrid crop varieties with unique combinations
- ✅ Storm damage and recovery mechanics
- ✅ Enhanced disease system with genetic resistance
- ✅ Shop bug fixes for consumable items

### v1.1.1 - Enhanced Features
- ✅ Livestock and building systems
- ✅ Research and achievement progression
- ✅ Contract and visitor mechanics
- ✅ Market dynamics and seasonal pricing

### v1.0.0 - Initial Release
- ✅ Basic farming mechanics
- ✅ Core crop growing system
- ✅ Simple economy and progression

## 🤝 **Contributing**

This is a personal project showcasing advanced React game development techniques. The codebase demonstrates:
- Complex state management with multiple interdependent systems
- Genetic algorithm simulation for crop breeding
- Dynamic weather system implementation
- Economic simulation with market fluctuations
- Achievement and progression systems

## 📝 **License**

Private project - Educational and demonstration purposes.

---

**Happy Farming! 🚜🌾**

*Built with React, Vite, and lots of agricultural passion!*
