import { useState, useEffect, useMemo } from 'react';
import { Playlist } from '@/types';

interface UserStats {
  totalPlaylists: number;
  completedPlaylists: number;
  totalVideos: number;
  completedVideos: number;
  totalLearningTime: number; // in seconds
  completedLearningTime: number; // in seconds
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activeDaysThisWeek: number;
  activeDaysThisMonth: number;
  averageCompletionRate: number;
  categoriesExplored: string[];
  weeklyProgress: Array<{
    date: string;
    videosCompleted: number;
    timeSpent: number;
  }>;
}

export const useUserStats = (playlists: Playlist[], userId: string | undefined) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate real-time stats from playlists
  const calculatedStats = useMemo(() => {
    if (!playlists.length) {
      return {
        totalPlaylists: 0,
        completedPlaylists: 0,
        totalVideos: 0,
        completedVideos: 0,
        totalLearningTime: 0,
        completedLearningTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: '',
        activeDaysThisWeek: 0,
        activeDaysThisMonth: 0,
        averageCompletionRate: 0,
        categoriesExplored: [],
        weeklyProgress: []
      };
    }

    const totalVideos = playlists.reduce((sum, p) => sum + p.videos.length, 0);
    const completedVideos = playlists.reduce((sum, p) => 
      sum + p.videos.filter(v => v.completed).length, 0
    );
    const completedPlaylists = playlists.filter(p => 
      p.videos.length > 0 && p.videos.every(v => v.completed)
    ).length;

    const totalLearningTime = playlists.reduce((sum, p) => sum + p.totalDuration, 0);
    const completedLearningTime = playlists.reduce((sum, p) => 
      sum + p.videos.filter(v => v.completed).reduce((videoSum, v) => videoSum + v.durationInSeconds, 0), 0
    );

    const categoriesExplored = [...new Set(playlists.flatMap(p => p.categories || []))];
    const averageCompletionRate = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

    return {
      totalPlaylists: playlists.length,
      completedPlaylists,
      totalVideos,
      completedVideos,
      totalLearningTime,
      completedLearningTime,
      currentStreak: 0, // Will be calculated from activity tracking
      longestStreak: 0,
      lastActivityDate: '',
      activeDaysThisWeek: 0,
      activeDaysThisMonth: 0,
      averageCompletionRate,
      categoriesExplored,
      weeklyProgress: []
    };
  }, [playlists]);

  // Load streak data from localStorage or Firebase
  useEffect(() => {
    const loadUserStats = () => {
      setLoading(true);
      
      if (userId) {
        // Load from Firebase (implement later)
        setStats(calculatedStats);
      } else {
        // Load from localStorage
        const storedStats = localStorage.getItem(`userStats_${userId || 'guest'}`);
        if (storedStats) {
          const parsed = JSON.parse(storedStats);
          setStats({ ...calculatedStats, ...parsed });
        } else {
          setStats(calculatedStats);
        }
      }
      
      setLoading(false);
    };

    loadUserStats();
  }, [calculatedStats, userId]);

  // Helper functions
  const updateStreak = (activityDate: Date = new Date()) => {
    const today = activityDate.toDateString();
    const currentStats = stats || calculatedStats;
    
    if (currentStats.lastActivityDate !== today) {
      const lastDate = new Date(currentStats.lastActivityDate || today);
      const diffTime = Math.abs(activityDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = 1;
      if (diffDays === 1) {
        // Consecutive day
        newStreak = currentStats.currentStreak + 1;
      } else if (diffDays === 0) {
        // Same day
        newStreak = currentStats.currentStreak;
      }
      
      const updatedStats = {
        ...currentStats,
        currentStreak: newStreak,
        longestStreak: Math.max(currentStats.longestStreak, newStreak),
        lastActivityDate: today
      };
      
      setStats(updatedStats);
      
      // Save to storage
      localStorage.setItem(`userStats_${userId || 'guest'}`, JSON.stringify({
        currentStreak: newStreak,
        longestStreak: updatedStats.longestStreak,
        lastActivityDate: today
      }));
    }
  };

  const getTimeUntilStreakExpires = () => {
    if (!stats?.lastActivityDate) return null;
    
    const lastActivity = new Date(stats.lastActivityDate);
    const tomorrow = new Date(lastActivity);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    const now = new Date();
    const timeLeft = tomorrow.getTime() - now.getTime();
    
    if (timeLeft <= 0) return null;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  return {
    stats: stats || calculatedStats,
    loading,
    updateStreak,
    getTimeUntilStreakExpires,
    // Derived values for easy use
    completionRate: stats ? (stats.completedVideos / Math.max(stats.totalVideos, 1)) * 100 : 0,
    timeSpentToday: 0, // Implement session tracking
    videosCompletedToday: 0 // Implement session tracking
  };
};
