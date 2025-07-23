import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";
import { DatabaseService } from "@/services/databaseService";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  username: string;
  rank: number;
  score: number;
  streak: number;
  weeklyHours: number;
  monthlyCompletions: number;
  totalAchievements: number;
  isCurrentUser?: boolean;
  trend: "up" | "down" | "same";
}

export interface LeaderboardData {
  timeframe: "weekly" | "monthly" | "all-time";
  entries: LeaderboardEntry[];
  userRank?: number;
  totalParticipants: number;
  lastUpdated: Date;
}

export const useLeaderboard = (userId?: string) => {
  const [weeklyLeaderboard, setWeeklyLeaderboard] =
    useState<LeaderboardData | null>(null);
  const [monthlyLeaderboard, setMonthlyLeaderboard] =
    useState<LeaderboardData | null>(null);
  const [allTimeLeaderboard, setAllTimeLeaderboard] =
    useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLeaderboards = useCallback(async () => {
    setLoading(true);

    const createLeaderboardData = (
      timeframe: "weekly" | "monthly" | "all-time",
      users: UserProfile[]
    ): LeaderboardData => {
      const entries: LeaderboardEntry[] = users.map((user, index) => ({
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: user.username,
        rank: index + 1,
        score: getScoreForTimeframe(user, timeframe),
        streak: user.stats.currentStreak,
        weeklyHours:
          Math.round((user.stats.weeklyLearningTime / 3600) * 10) / 10, // Convert seconds to hours with 1 decimal
        monthlyCompletions: user.stats.monthlyCompletions,
        totalAchievements: user.unlockedAchievements.length,
        isCurrentUser: userId ? user.uid === userId : false,
        trend: "same", // You can implement trend tracking later
      }));

      const userRank = userId
        ? entries.find((e) => e.userId === userId)?.rank
        : undefined;

      return {
        timeframe,
        entries,
        userRank,
        totalParticipants: users.length,
        lastUpdated: new Date(),
      };
    };

    const getScoreForTimeframe = (
      user: UserProfile,
      timeframe: string
    ): number => {
      switch (timeframe) {
        case "weekly":
          // weeklyLearningTime is in seconds, convert to minutes for scoring
          return Math.floor(user.stats.weeklyLearningTime / 60);
        case "monthly":
          return user.stats.monthlyCompletions * 100; // Reduced multiplier
        case "all-time":
          // completedLearningTime is in seconds, convert to minutes for scoring
          return Math.floor(user.stats.completedLearningTime / 60);
        default:
          return 0;
      }
    };

    try {
      const [weeklyUsers, monthlyUsers, allTimeUsers] = await Promise.all([
        DatabaseService.getLeaderboard("weekly"),
        DatabaseService.getLeaderboard("monthly"),
        DatabaseService.getLeaderboard("all-time"),
      ]);

      setWeeklyLeaderboard(createLeaderboardData("weekly", weeklyUsers));
      setMonthlyLeaderboard(createLeaderboardData("monthly", monthlyUsers));
      setAllTimeLeaderboard(createLeaderboardData("all-time", allTimeUsers));
    } catch (error) {
      console.error("Failed to load leaderboards:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  return {
    weeklyLeaderboard,
    monthlyLeaderboard,
    allTimeLeaderboard,
    loading,
    refreshLeaderboards: loadLeaderboards,
  };
};
