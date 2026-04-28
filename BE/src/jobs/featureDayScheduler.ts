import { AlumniService } from "../services/AlumniService.js";

function msUntilNextMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return Math.max(1000, next.getTime() - now.getTime());
}

async function runSelection() {
  try {
    await AlumniService.selectWinnerForDay(new Date());
  } catch (err) {
    // Do not crash the process due to a scheduled job failure.
    console.error("Feature-day winner selection failed:", err);
  }
}

export function startFeatureDayScheduler() {
  const scheduleNext = () => {
    const wait = msUntilNextMidnight();
    setTimeout(async () => {
      await runSelection();
      scheduleNext();
    }, wait);
  };

  scheduleNext();
}

