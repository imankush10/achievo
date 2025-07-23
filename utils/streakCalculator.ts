// src/utils/streakCalculator.ts

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

const isBrowser = typeof window !== "undefined";

export function getStreakData(userId?: string): StreakData {
  const defaultStreak = {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: "",
  };

  if (!isBrowser) {
    return defaultStreak;
  }

  const storageKey = `userStats_${userId || "guest"}`;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        lastActivityDate: data.lastActivityDate || "",
      };
    }
  } catch (error) {
    console.error("Failed to parse streak data from localStorage", error);
  }

  return defaultStreak;
}

export function updateStreak(
  userId?: string,
  activityDate: Date = new Date()
): StreakData {
  if (!isBrowser) {
    // Cannot update streak on the server
    return getStreakData(userId);
  }

  const today = activityDate.toDateString();
  const currentData = getStreakData(userId);

  if (currentData.lastActivityDate !== today) {
    const lastDate = new Date(currentData.lastActivityDate || today);
    const diffTime = Math.abs(activityDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = 1;
    if (diffDays === 1) {
      newStreak = currentData.currentStreak + 1;
    } else if (diffDays === 0) {
      newStreak = currentData.currentStreak;
    }

    const updatedData = {
      currentStreak: newStreak,
      longestStreak: Math.max(currentData.longestStreak, newStreak),
      lastActivityDate: today,
    };

    const storageKey = `userStats_${userId || "guest"}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    return updatedData;
  }

  return currentData;
}

export function getTimeUntilStreakExpires(
  lastActivityDate?: string
): { hours: number; minutes: number } | null {
  if (!isBrowser || !lastActivityDate) return null;

  const lastActivity = new Date(lastActivityDate);
  const tomorrow = new Date(lastActivity);
  tomorrow.setDate(tomorrow.getDate() + 2); // Set to the end of the next day
  tomorrow.setHours(0, 0, 0, 0); // Midnight at the start of the day after tomorrow

  const now = new Date();
  const timeLeft = tomorrow.getTime() - now.getTime();

  if (timeLeft <= 0) return null;

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}
