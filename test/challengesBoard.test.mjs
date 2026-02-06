import { describe, it, expect } from "vitest";
import {
  buildDailyOperations,
  getDailyOperationProgress,
  getResetCountdownLabel,
} from "../src/utils/challengesBoard.js";

describe("challengesBoard", () => {
  it("builds three deterministic daily operations", () => {
    const first = buildDailyOperations(4, "2026-02-06");
    const second = buildDailyOperations(4, "2026-02-06");

    expect(first.length).toBe(3);
    expect(second.length).toBe(3);
    expect(first.map((entry) => entry.id)).toEqual(second.map((entry) => entry.id));
    expect(first.every((entry) => entry.target > 0)).toBe(true);
  });

  it("derives progress from game state", () => {
    const sampleState = {
      coins: 420,
      inventory: { carrot: 3, corn: 4, fertilizer: 2 },
      plots: [{ state: "ready" }, { state: "growing" }, { state: "empty" }],
      buildings: { barn: { built: true }, shed: { built: false } },
      livestock: { animals: [{}, {}] },
    };
    const challenges = buildDailyOperations(3, "2026-02-07");
    const progressValues = challenges.map((challenge) =>
      getDailyOperationProgress(sampleState, challenge)
    );

    expect(progressValues.every((value) => Number.isFinite(value))).toBe(true);
    expect(progressValues.some((value) => value > 0)).toBe(true);
  });

  it("formats reset countdown text", () => {
    const label = getResetCountdownLabel(Date.now());
    expect(label.includes("h")).toBe(true);
    expect(label.includes("m")).toBe(true);
  });
});
