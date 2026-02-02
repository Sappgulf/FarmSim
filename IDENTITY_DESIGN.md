# Identity Layer (Cozy Sim Path B)

## Goals
- **Mood**: Soft, positive-only vibe meter that reflects cozy actions. Event-driven only.
- **Memory**: A scrapbook of milestone moments (idempotent, capped, no background scans).
- **Philosophy**: A flavor-forward choice that tunes suggestions and tone without raw power.

## State Location
- Stored in **`state.identity`** (GameContext reducer + persistence).
- Save version: **v9** (migration adds identity defaults).

## Data Schema
```ts
identity: {
  moodScore: number; // 0–100
  moodTier: 'calm' | 'cozy' | 'thriving';
  moodContributors: Array<{
    id: string;
    delta: number;
    reason: string;
    score: number;
    tier: string;
    at: number; // timestamp
  }>;
  philosophy: 'nature_first' | 'market_maven' | 'slow_living';
  memories: Array<{
    id: string;
    type: 'season' | 'festival' | 'decor' | 'reputation' | 'collection' | 'milestone';
    title: string;
    text: string;
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    dayCount?: number;
    createdAt: number;
    stats?: {
      coins: number;
      reputation: number;
      totalHarvested: number;
    };
  }>;
  counters: {
    decorationsPlacedTotal: number;
    festivalDays: number;
    seasonalHarvests: { spring: number; summer: number; fall: number; winter: number };
    seasonCropDiscoveries: { spring: number; summer: number; fall: number; winter: number };
    repTierUnlocks: string[];
    lastPlanCompletionDay: number | null;
  };
}
```

## Mood Tiers
- **Calm (0–39)**
- **Cozy (40–69)**
- **Thriving (70–100)**

Mood is positive-only and applied on **events** (no per-tick work).

### Mood Contributors (Event-Driven)
- **Decoration placement**: +1 per new placement (capped per action).
- **Seasonal planting**: +1 when planting a crop in its favored season.
- **Festival day harvests**: +1 if market mood is a festival day.
- **Rainy harvest**: +1 when harvesting during rain.
- **Completing Today’s Plan**: +2 when all daily quests are claimed.
- **Town reputation tier unlock**: +2 (paired with memory).

## Memories (Scrapbook)
- **Idempotent**: each memory has a unique `id` and can’t be added twice.
- **Capped**: max 100 entries, most recent first.
- **Triggered only by events**:
  - **First winter harvest**
  - **First festival day** (market mood = festival)
  - **Decor milestones** (10, 25 placed)
  - **Town rep tier unlocks**
  - **Discover all crops in a season**

## Philosophy
Three flavors, no raw power:
1. **Nature First** → prioritizes weather/season tips
2. **Market Maven** → prioritizes market/rep tips
3. **Slow Living** → adds slow, reflective flavor

Used by:
- **Town Board “Today’s Plan”** ordering + tone
- **Scrapbook flavor text

## Event Hooks (No Hot Loop)
- **onDayAdvance**: festival day memory + mood touch.
- **onHarvest**: mood deltas + seasonal harvest counter + winter memory.
- **onPlant**: seasonal harmony mood.
- **onDecorationPlaced**: mood + decor memories.
- **onRepTierUnlocked**: memory + mood.
- **onCollectionDiscovery**: seasonal discovery counter + memory.
- **onDailyPlanCompleted**: mood + plan completion counter.

## Persistence Rules
- **Migration**: save v8 → v9 adds identity defaults.
- **Clamping**: moodScore clamped 0–100, memories capped, contributor log capped.
- **No scanning**: counters updated incrementally on events only.

## UI Surfaces
- **Town Board**: Mood card + flavor line (“The farm feels…”)
- **Cozy Status Bar**: Compact mood chip
- **Collections**: Scrapbook section with filters
- **Settings**: Philosophy selector
