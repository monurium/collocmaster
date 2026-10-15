import { SRSItem, ReviewLog, Grade } from '../types';

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;
export const MASTERY_INTERVAL_THRESHOLD = 21; // in days

/**
 * Creates a default SRS item for a new collocation
 */
export function createDefaultSRSItem(collocationId: string): SRSItem {
  return {
    collocationId,
    repetitionCount: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReviewDate: 0, // 0 indicates new/never reviewed
    history: [],
  };
}

/**
 * Pure SM-2 Calculation Engine
 * Implements the exact algorithm as specified:
 * - Grade 1 (Again): Resets interval to 0 (review today). Drops easeFactor by 0.2.
 * - Grade 2 (Hard): Interval * 1.2. Drops easeFactor by 0.15.
 * - Grade 3 (Good): Interval * 2.5. Keeps easeFactor same.
 * - Grade 4 (Easy): Interval * easeFactor * 1.3. Increases easeFactor by 0.15.
 * Limits: Minimum easeFactor is 1.3.
 */
export function calculateSM2(
  item: SRSItem,
  grade: Grade,
  timeSpentMs: number,
  now: number = Date.now()
): { updatedItem: SRSItem; log: ReviewLog } {
  let { interval, easeFactor, repetitionCount } = item;
  let nextReviewDate: number;

  switch (grade) {
    case 1: { // Again
      interval = 0;
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      repetitionCount = 0;
      // Due in 10 minutes (or same day review)
      nextReviewDate = now + 10 * 60 * 1000;
      break;
    }
    case 2: { // Hard
      if (interval === 0) {
        interval = 1;
      } else {
        interval = Math.max(1, Math.round(interval * 1.2));
      }
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      repetitionCount += 1;
      nextReviewDate = now + interval * 24 * 60 * 60 * 1000;
      break;
    }
    case 3: { // Good
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 3;
      } else {
        interval = Math.max(1, Math.round(interval * 2.5));
      }
      // easeFactor remains the same
      repetitionCount += 1;
      nextReviewDate = now + interval * 24 * 60 * 60 * 1000;
      break;
    }
    case 4: { // Easy
      if (interval === 0) {
        interval = 3;
      } else if (interval === 1) {
        interval = 5;
      } else {
        interval = Math.max(2, Math.round(interval * easeFactor * 1.3));
      }
      easeFactor = easeFactor + 0.15;
      repetitionCount += 1;
      nextReviewDate = now + interval * 24 * 60 * 60 * 1000;
      break;
    }
  }

  // Round easeFactor to 2 decimal places to avoid floating point drift
  easeFactor = Math.round(easeFactor * 100) / 100;

  const log: ReviewLog = {
    timestamp: now,
    grade,
    timeSpentMs,
  };

  const updatedItem: SRSItem = {
    ...item,
    interval,
    easeFactor,
    repetitionCount,
    nextReviewDate,
    history: [...item.history, log],
  };

  return { updatedItem, log };
}

/**
 * Returns human-readable preview of next intervals for UI buttons (e.g. "10m", "1d", "3d", "8d")
 */
export function getIntervalPreviews(item: SRSItem): Record<Grade, string> {
  const sim2 = calculateSM2(item, 2, 0);
  const sim3 = calculateSM2(item, 3, 0);
  const sim4 = calculateSM2(item, 4, 0);

  return {
    1: '10 min',
    2: formatDays(sim2.updatedItem.interval),
    3: formatDays(sim3.updatedItem.interval),
    4: formatDays(sim4.updatedItem.interval),
  };
}

function formatDays(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `${months} mo`;
}

/**
 * Check if card is due for review
 */
export function isDue(item: SRSItem, now: number = Date.now()): boolean {
  return item.nextReviewDate <= now;
}

/**
 * Check if item is mastered (interval > 21 days)
 */
export function isMastered(item: SRSItem): boolean {
  return item.interval > MASTERY_INTERVAL_THRESHOLD;
}

/**
 * Calculate consecutive daily streak from review logs
 */
export function calculateStreak(history: ReviewLog[]): number {
  if (!history || history.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const log of history) {
    const d = new Date(log.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateSet.add(key);
  }

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let checkDate = new Date(now);
  // If no review today, check if yesterday had one to maintain streak
  if (!dateSet.has(todayKey)) {
    if (!dateSet.has(yesterdayKey)) {
      return 0;
    }
    checkDate = yesterday;
  }

  let streak = 0;
  while (true) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (dateSet.has(key)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate 7-day retention rate (% of reviews graded 3 or 4 in past 7 days)
 */
export function calculateRetentionRate(history: ReviewLog[], now: number = Date.now()): number {
  if (!history || history.length === 0) return 100;

  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentLogs = history.filter(l => l.timestamp >= sevenDaysAgo);

  if (recentLogs.length === 0) {
    // If no reviews in 7 days, check all time or default to 100
    if (history.length > 0) {
      const goodCount = history.filter(l => l.grade === 3 || l.grade === 4).length;
      return Math.round((goodCount / history.length) * 100);
    }
    return 100;
  }

  const goodReviews = recentLogs.filter(l => l.grade === 3 || l.grade === 4).length;
  return Math.round((goodReviews / recentLogs.length) * 100);
}

/**
 * Generate 30-day contribution heatmap data
 */
export function generate30DayHeatmap(history: ReviewLog[], now: number = Date.now()): Array<{
  date: string;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  dayOfWeek: number;
}> {
  const countsByDate: Record<string, number> = {};
  for (const log of history) {
    const d = new Date(log.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    countsByDate[key] = (countsByDate[key] || 0) + 1;
  }

  const result: Array<{
    date: string;
    count: number;
    intensity: 0 | 1 | 2 | 3 | 4;
    dayOfWeek: number;
  }> = [];

  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - i);
    const key = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const count = countsByDate[key] || 0;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 12) intensity = 4;
    else if (count >= 7) intensity = 3;
    else if (count >= 3) intensity = 2;
    else if (count >= 1) intensity = 1;

    result.push({
      date: key,
      count,
      intensity,
      dayOfWeek: targetDate.getDay(),
    });
  }

  return result;
}
