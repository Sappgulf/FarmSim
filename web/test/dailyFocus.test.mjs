import { describe, it, expect } from "vitest";
import {
  DAILY_FOCUS_BONUS_MULTIPLIER,
  getDailyCropFocus,
  getEligibleDailyFocusCrops,
} from "../src/utils/dailyFocus.js";

describe("dailyFocus", () => {
  it("returns deterministic daily crop focus for the same day key", () => {
    const state = { level: 5 };
    const first = getDailyCropFocus(state, "2026-02-06");
    const second = getDailyCropFocus(state, "2026-02-06");

    expect(first?.cropId).toBeTruthy();
    expect(first?.cropId).toBe(second?.cropId);
    expect(first?.bonusMultiplier).toBe(DAILY_FOCUS_BONUS_MULTIPLIER);
  });

  it("filters eligible crops by level", () => {
    const levelOne = getEligibleDailyFocusCrops(1);
    const levelFive = getEligibleDailyFocusCrops(5);
    expect(levelOne.length).toBeGreaterThan(0);
    expect(levelFive.length).toBeGreaterThanOrEqual(levelOne.length);
  });
});
