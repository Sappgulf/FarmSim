export function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTimeRemaining(endTime, currentTime) {
  const remaining = Math.max(0, endTime - currentTime);
  return formatTime(remaining);
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "day";
  if (hour >= 12 && hour < 18) return "dusk";
  if (hour >= 18 || hour < 6) return "night";
  return "dawn";
}
