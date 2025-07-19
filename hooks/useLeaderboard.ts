import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { UserProfileService } from '@/services/userProfile';

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
  trend: 'up' | 'down' | 'same';
}

export interface LeaderboardData {
  timeframe: 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  userRank?: number;
  totalParticipants: number;
  lastUpdated: Date;
}

export const useLeaderboard = (userId?: string) => {
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardData | null>(null);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardData | null>(null);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, [userId]);

  const loadLeaderboards = async () => {
    setLoading(true);
    
    try {
      const [weeklyUsers, monthlyUsers, allTimeUsers] = await Promise.all([
        UserProfileService.getLeaderboard('weekly'),
        UserProfileService.getLeaderboard('monthly'),
        UserProfileService.getLeaderboard('all-time')
      ]);

      setWeeklyLeaderboard(createLeaderboardData('weekly', weeklyUsers));
      setMonthlyLeaderboard(createLeaderboardData('monthly', monthlyUsers));
      setAllTimeLeaderboard(createLeaderboardData('all-time', allTimeUsers));
    } catch (error) {
      console.error('Failed to load leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLeaderboardData = (
    timeframe: 'weekly' | 'monthly' | 'all-time',
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
      weeklyHours: user.stats.weeklyLearningTime,
      monthlyCompletions: user.stats.monthlyCompletions,
      totalAchievements: user.unlockedAchievements.length,
      isCurrentUser: userId ? user.uid === userId : false,
      trend: 'same' // You can implement trend tracking later
    }));

    const userRank = userId ? entries.find(e => e.userId === userId)?.rank : undefined;

    return {
      timeframe,
      entries,
      userRank,
      totalParticipants: users.length,
      lastUpdated: new Date()
    };
  };

  const getScoreForTimeframe = (user: UserProfile, timeframe: string): number => {
    switch (timeframe) {
      case 'weekly':
        return Math.floor(user.stats.weeklyLearningTime * 100);
      case 'monthly':
        return user.stats.monthlyCompletions * 500;
      case 'all-time':
        return Math.floor(user.stats.completedLearningTime / 3600 * 100); // Hours * 100
      default:
        return 0;
    }
  };

  return {
    weeklyLeaderboard,
    monthlyLeaderboard,
    allTimeLeaderboard,
    loading,
    refreshLeaderboards: loadLeaderboards
  };
};
