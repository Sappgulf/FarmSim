export const MARKET_TRENDS = {
  high: { multiplier: 1.35, name: "📈 High Demand", color: "text-emerald-600" },
  normal: { multiplier: 1.0, name: "📊 Normal", color: "text-slate-600" },
  low: { multiplier: 0.85, name: "📉 Low Demand", color: "text-red-600" },
};

export const ORDER_SYSTEM = {
  refreshSeconds: 300,
  slots: 3,
  minItems: 1,
  maxItems: 2,
  minQty: 2,
  maxQty: 6,
  rewardMultiplier: 1.15,
  rerollCost: 25,
  streakBonusEvery: 3,
  streakBonusCoins: 30,
};
