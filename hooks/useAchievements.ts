import { useState, useEffect, useMemo } from 'react';
import { Playlist } from '@/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'completion' | 'streak' | 'time' | 'exploration' | 'special';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  requirement: number;
}

export const useAchievements = (userId: string | undefined, playlists: Playlist[]) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Define all possible achievements
  const allAchievements: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
    // Completion Achievements
    {
      id: 'first_video',
      title: 'First Steps',
      description: 'Complete your first video',
      icon: '🎯',
      rarity: 'common',
      category: 'completion',
      requirement: 1
    },
    {
      id: 'first_playlist',
      title: 'Playlist Pioneer',
      description: 'Complete your first playlist',
      icon: '✅',
      rarity: 'uncommon',
      category: 'completion',
      requirement: 1
    },
    {
      id: 'playlist_collector',
      title: 'Playlist Collector',
      description: 'Complete 5 playlists',
      icon: '📚',
      rarity: 'rare',
      category: 'completion',
      requirement: 5
    },
    {
      id: 'learning_master',
      title: 'Learning Master',
      description: 'Complete 10 playlists',
      icon: '🏆',
      rarity: 'epic',
      category: 'completion',
      requirement: 10
    },
    
    // Streak Achievements
    {
      id: 'week_streak',
      title: 'Consistency Champion',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      rarity: 'uncommon',
      category: 'streak',
      requirement: 7
    },
    {
      id: 'month_streak',
      title: 'Dedication Warrior',
      description: 'Maintain a 30-day learning streak',
      icon: '⚡',
      rarity: 'epic',
      category: 'streak',
      requirement: 30
    },
    {
      id: 'legendary_streak',
      title: 'Legendary Learner',
      description: 'Maintain a 100-day learning streak',
      icon: '👑',
      rarity: 'legendary',
      category: 'streak',
      requirement: 100
    },
    
    // Time Achievements
    {
      id: 'ten_hours',
      title: 'Time Invested',
      description: 'Complete 10 hours of learning',
      icon: '⏰',
      rarity: 'uncommon',
      category: 'time',
      requirement: 36000 // 10 hours in seconds
    },
    {
      id: 'hundred_hours',
      title: 'Dedicated Scholar',
      description: 'Complete 100 hours of learning',
      icon: '📖',
      rarity: 'epic',
      category: 'time',
      requirement: 360000 // 100 hours in seconds
    },
    
    // Exploration Achievements
    {
      id: 'category_explorer',
      title: 'Knowledge Explorer',
      description: 'Learn from 5 different categories',
      icon: '🗺️',
      rarity: 'rare',
      category: 'exploration',
      requirement: 5
    },
    {
      id: 'renaissance_learner',
      title: 'Renaissance Learner',
      description: 'Learn from 10 different categories',
      icon: '🎨',
      rarity: 'legendary',
      category: 'exploration',
      requirement: 10
    },
    
    // Special Achievements
    {
      id: 'speed_runner',
      title: 'Speed Runner',
      description: 'Complete a playlist in one day',
      icon: '💨',
      rarity: 'rare',
      category: 'special',
      requirement: 1
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Complete videos after midnight',
      icon: '🦉',
      rarity: 'uncommon',
      category: 'special',
      requirement: 5
    }
  ];

  const calculateAchievementProgress = (achievement: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>) => {
    switch (achievement.id) {
      case 'first_video':
        const totalCompleted = playlists.reduce((sum, p) => sum + p.videos.filter(v => v.completed).length, 0);
        return Math.min(totalCompleted, achievement.requirement);
        
      case 'first_playlist':
      case 'playlist_collector':
      case 'learning_master':
        const completedPlaylists = playlists.filter(p => 
          p.videos.length > 0 && p.videos.every(v => v.completed)
        ).length;
        return Math.min(completedPlaylists, achievement.requirement);
        
      case 'week_streak':
      case 'month_streak':
      case 'legendary_streak':
        const userStats = localStorage.getItem(`userStats_${userId || 'guest'}`);
        const currentStreak = userStats ? JSON.parse(userStats).currentStreak || 0 : 0;
        return Math.min(currentStreak, achievement.requirement);
        
      case 'ten_hours':
      case 'hundred_hours':
        const totalTime = playlists.reduce((sum, p) => 
          sum + p.videos.filter(v => v.completed).reduce((timeSum, v) => timeSum + v.durationInSeconds, 0), 0
        );
        return Math.min(totalTime, achievement.requirement);
        
      case 'category_explorer':
      case 'renaissance_learner':
        const uniqueCategories = [...new Set(playlists.flatMap(p => p.categories || []))];
        return Math.min(uniqueCategories.length, achievement.requirement);
        
      default:
        return 0;
    }
  };

  // Calculate current achievements
  const currentAchievements = useMemo(() => {
    return allAchievements.map(achievement => {
      const progress = calculateAchievementProgress(achievement);
      const unlocked = progress >= achievement.requirement;
      
      return {
        ...achievement,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : undefined
      };
    });
  }, [playlists, userId]);

  // Load saved achievements and check for new ones
  useEffect(() => {
    const storageKey = `achievements_${userId || 'guest'}`;
    const saved = localStorage.getItem(storageKey);
    const savedAchievements = saved ? JSON.parse(saved) : {};
    
    const newlyUnlockedAchievements: Achievement[] = [];
    
    const updatedAchievements = currentAchievements.map(achievement => {
      const savedData = savedAchievements[achievement.id];
      
      if (achievement.unlocked && !savedData?.unlocked) {
        // Newly unlocked achievement
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date()
        };
        newlyUnlockedAchievements.push(unlockedAchievement);
        return unlockedAchievement;
      }
      
      return {
        ...achievement,
        unlockedAt: savedData?.unlockedAt ? new Date(savedData.unlockedAt) : undefined
      };
    });
    
    setAchievements(updatedAchievements);
    
    if (newlyUnlockedAchievements.length > 0) {
      setNewlyUnlocked(newlyUnlockedAchievements);
      
      // Save updated achievements
      const toSave = updatedAchievements.reduce((acc, achievement) => {
        acc[achievement.id] = {
          unlocked: achievement.unlocked,
          unlockedAt: achievement.unlockedAt
        };
        return acc;
      }, {} as Record<string, any>);
      
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    }
  }, [currentAchievements, userId]);

  const dismissNewAchievements = () => {
    setNewlyUnlocked([]);
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    newlyUnlocked,
    dismissNewAchievements,
    getRarityColor,
    unlockedCount,
    totalCount,
    progress: totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0
  };
};
