import { describe, it, expect } from "vitest";
import {
  CROP_RARITY_MAP,
  getRarityColor,
  rollMysterySeed,
  rollMysterySeedWithGuarantee,
} from "../src/components/farm-sim/constants/mysterySeedData.js";

const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"];

describe("mysterySeedData", () => {
  it("rollMysterySeed always returns a valid crop and rarity", () => {
    for (let i = 0; i < 200; i += 1) {
      const result = rollMysterySeed();
      expect(typeof result.cropId).toBe("string");
      expect(result.cropId.length).toBeGreaterThan(0);
      expect(CROP_RARITY_MAP[result.cropId]).toBeTruthy();
      expect(rarityOrder.includes(result.rarity)).toBe(true);
      expect(result.rarityData?.id).toBe(result.rarity);
    }
  });

  it("rollMysterySeedWithGuarantee respects minimum rarity", () => {
    const minimum = "rare";
    for (let i = 0; i < 100; i += 1) {
      const result = rollMysterySeedWithGuarantee(minimum);
      expect(rarityOrder.indexOf(result.rarity)).toBeGreaterThanOrEqual(
        rarityOrder.indexOf(minimum)
      );
      expect(result.rarityData?.id).toBe(result.rarity);
    }
  });

  it("getRarityColor resolves lowercase rarity ids", () => {
    expect(getRarityColor("common")).toBe("#9ca3af");
    expect(getRarityColor("legendary")).toBe("#eab308");
  });
});
