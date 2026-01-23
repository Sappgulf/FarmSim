/**
 * Help Guide Component
 * In-game encyclopedia and help system
 */
import React, { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Search, Book, Leaf, Droplet, Sun, Cloud, Building2, Coins,
  Trophy, Dna, Zap, HelpCircle, ChevronRight, ExternalLink, Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { CROPS, CROP_FAMILIES, QUALITY_TIERS, RARITY_COLORS } from '../../data/crops';
import { BUILDINGS, LIVESTOCK } from '../../data/buildings';
import { SEASON_DATA, WEATHER_TYPES } from '../../data/constants';

// Guide categories
const CATEGORIES = [
  { id: 'basics', label: 'Getting Started', icon: Book, color: 'text-blue-500' },
  { id: 'crops', label: 'Crops & Planting', icon: Leaf, color: 'text-green-500' },
  { id: 'weather', label: 'Weather & Seasons', icon: Cloud, color: 'text-sky-500' },
  { id: 'buildings', label: 'Buildings', icon: Building2, color: 'text-amber-500' },
  { id: 'animals', label: 'Animals', icon: () => <span>🐄</span>, color: 'text-orange-500' },
  { id: 'economy', label: 'Economy & Tips', icon: Coins, color: 'text-yellow-500' },
  { id: 'advanced', label: 'Advanced', icon: Sparkles, color: 'text-purple-500' },
];

// Guide content
const GUIDE_CONTENT = {
  basics: {
    title: 'Getting Started',
    sections: [
      {
        title: 'How to Play',
        content: `Welcome to FarmSim! Your goal is to build a successful farm by planting crops, caring for animals, and expanding your operation.

**Basic Flow:**
1. Select a seed from your inventory
2. Click an empty plot to plant
3. Water your crops to help them grow
4. Harvest when they're ready (glowing green)
5. Sell harvests for coins
6. Buy more seeds and expand!`,
      },
      {
        title: 'Controls',
        content: `**Desktop:**
- Click empty plots to plant selected seed
- Click growing crops for actions (water, fertilize, harvest)
- Use tabs on the right for shop, achievements, etc.

**Mobile:**
- Tap plots and buttons
- Use bottom navigation to switch views
- Pull down to refresh weather`,
      },
      {
        title: 'Goals & Levels',
        content: `Each level has a coin target to reach within a time limit. Complete levels to earn bonus coins and unlock new challenges.

**Level Progression:**
- Level 1: Earn 100 coins in 6 minutes
- Level 2: Earn 200 coins in 8 minutes
- And more challenging levels await!

In Endless mode, there's no time limit - farm at your own pace!`,
      },
    ],
  },
  crops: {
    title: 'Crops & Planting',
    sections: [
      {
        title: 'Crop Basics',
        content: `Each crop has unique properties:
- **Growth Time:** How long until harvest
- **Base Value:** Coins earned per harvest
- **Season:** When it grows best
- **Family:** Used for crop rotation bonuses

**Rarity tiers:** Common < Uncommon < Rare < Epic < Legendary`,
      },
      {
        title: 'Quality System',
        content: `Harvested crops have quality ratings that multiply their value:

- **Normal** (1.0x) - Basic quality
- **Good ⭐** (1.3x) - Well-grown crop
- **Excellent ⭐⭐** (1.7x) - Superior quality
- **Perfect ⭐⭐⭐** (2.2x) - Flawless harvest!

**Improve quality by:**
- Using fertilizer (+10% per application)
- Building a Beehive (+25% chance)
- Planting in the right season
- Crop rotation bonuses`,
      },
      {
        title: 'Crop Rotation',
        content: `Planting different crop families in sequence provides bonus coins!

**Good rotations:**
- Root → Leaf (+20%)
- Fruit → Root (+25%)
- Leaf → Grain (+15%)

The previous crop's family is tracked per plot. Check the tooltip!`,
      },
      {
        title: 'Mutations',
        content: `Rare mutations can occur when harvesting! These special crops have enhanced properties and sell for much more.

**Examples:**
- Golden Carrot (from Carrot) - 1.8x bonus
- Rainbow Corn (from Corn) - 2.1x bonus
- Giant Pumpkin (from Pumpkin) - 2.8x bonus

Mutations are random but become more likely at higher prestige levels.`,
      },
    ],
  },
  weather: {
    title: 'Weather & Seasons',
    sections: [
      {
        title: 'Seasons',
        content: `Seasons change every 5 minutes and affect crop growth:

🌸 **Spring** - 1.2x growth speed, best for berries
☀️ **Summer** - 1.1x growth, best for fruit & grain
🍂 **Fall** - Normal growth, harvest season bonuses
❄️ **Winter** - 0.8x growth, challenging but rewarding

Plant crops in their preferred season for bonus value!`,
      },
      {
        title: 'Weather Effects',
        content: `Weather changes every 30 seconds:

☀️ **Sunny** - Normal conditions
☁️ **Cloudy** - Slightly slower growth
🌧️ **Rainy** - Auto-waters crops, growth boost!
⛈️ **Stormy** - Risk of crop damage
🏜️ **Drought** - Crops wilt faster, water often
🥶 **Frost** - Growth stops, frost damage risk
💨 **Windy** - Moderate effects

Check the 5-day forecast to plan ahead!`,
      },
    ],
  },
  buildings: {
    title: 'Buildings',
    sections: [
      {
        title: 'Building Overview',
        content: `Buildings provide permanent bonuses to your farm:

🏚️ **Barn** (200) - +20% harvest value
🏡 **Greenhouse** (350) - +50% growth speed
🗼 **Silo** (150) - Auto-sell overflow
🏭 **Workshop** (500) - Process crops for more value
🌪️ **Windmill** (400) - +5 coins per minute passive
🐝 **Beehive** (250) - +25% quality chance
🪣 **Well** (180) - Auto-water nearby plots
♻️ **Compost** (120) - Auto-generate fertilizer`,
      },
      {
        title: 'Workshop Processing',
        content: `With a Workshop, you can process raw crops into valuable goods:

- 🥕 Carrot → 🥤 Carrot Juice (2.5x value)
- 🌽 Corn → 🍿 Popcorn (3x value)
- 🍓 Strawberry → 🍓 Jam (4x value)
- 🎃 Pumpkin → 🥧 Pie (4.5x value)

Processing takes time but significantly increases profits!`,
      },
    ],
  },
  animals: {
    title: 'Animals',
    sections: [
      {
        title: 'Livestock',
        content: `Animals provide passive income through their products:

🐔 **Chicken** (80) - 🥚 Eggs every 2 min (8 coins)
🐄 **Cow** (200) - 🥛 Milk every 5 min (25 coins)
🐷 **Pig** (150) - 🍄 Truffles every 10 min (45 coins)
🐑 **Sheep** (120) - 🧶 Wool every 8 min (35 coins)`,
      },
      {
        title: 'Animal Care',
        content: `Keep your animals happy for maximum productivity:

- **Feed** them regularly (costs 5 coins)
- **Water** them often (costs 2 coins)
- Happy animals produce faster!

Neglected animals become sad and stop producing. Check their status regularly!`,
      },
    ],
  },
  economy: {
    title: 'Economy & Tips',
    sections: [
      {
        title: 'Making Money',
        content: `**Early Game:**
- Plant fast crops (Lettuce, Carrot)
- Water consistently
- Use the harvest combo system

**Mid Game:**
- Buy the Barn for +20% value
- Expand to 4x4 or 5x5 grid
- Get a Beehive for quality bonus

**Late Game:**
- Build the Workshop for processing
- Get animals for passive income
- Aim for rare mutations`,
      },
      {
        title: 'Combo System',
        content: `Harvest quickly to build combos!

- Harvest within 3 seconds of your last harvest
- Combo multiplier increases with each harvest
- Max multiplier: 2x at 11+ combo
- Combos reset after 3 seconds of no harvesting

**Pro tip:** Plant crops with similar growth times to harvest in batches!`,
      },
      {
        title: 'Prestige System',
        content: `Prestige resets your coins but provides permanent bonuses:

**Requirements:**
- Level 1: 500 total earned → 1.15x multiplier
- Level 2: 2000 total → 1.35x multiplier
- Level 3: 8000 total → 1.6x multiplier
- And more!

Prestige also increases mutation chances and quality bonuses.`,
      },
    ],
  },
  advanced: {
    title: 'Advanced Strategies',
    sections: [
      {
        title: 'Optimal Layouts',
        content: `**3x3 Grid:** Focus on one crop type for combo harvests
**4x4 Grid:** Mix fast and slow crops for steady income
**5x5 Grid:** Create dedicated zones (fast, slow, premium)

Consider building placement for maximum effect!`,
      },
      {
        title: 'Breeding & Hybrids',
        content: `The breeding system allows you to create powerful hybrid crops by combining parent crops.

**Recipe Examples:**
- Carrot + Carrot (5x) → Super Carrot
- Corn + Sunflower (3x) → Rainbow Corn
- Bell Pepper + Tomato (5x) → Dragon Pepper

Higher prestige levels unlock more recipes and better success rates.`,
      },
      {
        title: 'Min-Maxing',
        content: `**Speed runs:** Focus on Lettuce (fastest) + Barn + combo harvests
**Value runs:** Pumpkin in Fall + Workshop + Beehive
**Passive income:** Windmill + max animals + auto-systems

Mix strategies based on your current goals and level requirements!`,
      },
    ],
  },
};

function HelpGuideComponent({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const currentContent = GUIDE_CONTENT[selectedCategory];

  // Filter sections based on search
  const filteredSections = searchQuery
    ? currentContent.sections.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentContent.sections;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative m-4 flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex items-center gap-2">
            <Book size={24} />
            <h2 className="text-xl font-bold">Farm Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 border-r bg-gray-50 overflow-y-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`
                    w-full flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors
                    ${selectedCategory === cat.id
                      ? 'bg-white border-r-2 border-emerald-500 font-medium'
                      : 'hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={cat.color} size={18} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {currentContent.title}
            </h3>

            {filteredSections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredSections.map((section, i) => (
                  <div key={i}>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ChevronRight size={18} className="text-emerald-500" />
                      {section.title}
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                      {section.content.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-center text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">?</kbd> to open this guide anytime
        </div>
      </div>
    </div>,
    document.body
  );
}

export const HelpGuide = memo(HelpGuideComponent);
