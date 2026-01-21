import { clamp } from "../utils/gameMath.mjs";

export function getGrowthStage(elapsedSeconds, secondsPerStage, stages) {
  if (!Number.isFinite(elapsedSeconds) || !Number.isFinite(secondsPerStage) || secondsPerStage <= 0) {
    return 0;
  }
  const rawStage = Math.floor(elapsedSeconds / secondsPerStage);
  return clamp(rawStage, 0, stages);
}
