import { useState, useEffect } from 'react';
import { Playlist } from '@/types';

export interface Goal {
  id: string;
  type: 'weekly_hours' | 'monthly_playlists' | 'daily_streak' | 'completion_rate';
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
}

export const useGoals = (userId: string | undefined, playlists: Playlist[]) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Default goals for new users
  const defaultGoals: Omit<Goal, 'id' | 'current' | 'completed' | 'createdAt'>[] = [
    {
      type: 'weekly_hours',
      title: 'Weekly Learning Goal',
      description: 'Complete learning hours each week',
      target: 5,
      unit: 'hours',
    },
    {
      type: 'monthly_playlists',
      title: 'Monthly Playlist Goal',
      description: 'Finish complete playlists each month',
      target: 2,
      unit: 'playlists',
    },
    {
      type: 'daily_streak',
      title: 'Learning Streak',
      description: 'Maintain daily learning streak',
      target: 7,
      unit: 'days',
    }
  ];

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = () => {
    setLoading(true);
    
    const storageKey = `goals_${userId || 'guest'}`;
    const storedGoals = localStorage.getItem(storageKey);
    
    if (storedGoals) {
      const parsedGoals = JSON.parse(storedGoals).map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        deadline: goal.deadline ? new Date(goal.deadline) : undefined
      }));
      setGoals(parsedGoals);
    } else {
      // Create default goals for new users
      const initialGoals = defaultGoals.map(goal => ({
        ...goal,
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        current: 0,
        completed: false,
        createdAt: new Date()
      }));
      setGoals(initialGoals);
      saveGoals(initialGoals);
    }
    
    setLoading(false);
  };

  const saveGoals = (goalsToSave: Goal[]) => {
    const storageKey = `goals_${userId || 'guest'}`;
    localStorage.setItem(storageKey, JSON.stringify(goalsToSave));
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  const createGoal = (goalData: Omit<Goal, 'id' | 'current' | 'completed' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      current: 0,
      completed: false,
      createdAt: new Date()
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
    return newGoal;
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  // Calculate current progress for goals
  const calculateGoalProgress = (goal: Goal): number => {
    switch (goal.type) {
      case 'weekly_hours':
        // Calculate hours completed this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const thisWeekHours = playlists.reduce((total, playlist) => {
          const completedThisWeek = playlist.videos.filter(video => 
            video.completed && new Date(playlist.updatedAt) >= weekStart
          );
          return total + completedThisWeek.reduce((sum, v) => sum + v.durationInSeconds, 0);
        }, 0) / 3600; // Convert to hours
        
        return Math.min(thisWeekHours, goal.target);
        
      case 'monthly_playlists':
        // Calculate playlists completed this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const thisMonthCompleted = playlists.filter(playlist => {
          const isCompleted = playlist.videos.length > 0 && playlist.videos.every(v => v.completed);
          const completedThisMonth = new Date(playlist.updatedAt) >= monthStart;
          return isCompleted && completedThisMonth;
        }).length;
        
        return Math.min(thisMonthCompleted, goal.target);
        
      case 'daily_streak':
        // Get current streak from localStorage
        const userStats = localStorage.getItem(`userStats_${userId || 'guest'}`);
        const currentStreak = userStats ? JSON.parse(userStats).currentStreak || 0 : 0;
        return Math.min(currentStreak, goal.target);
        
      default:
        return goal.current;
    }
  };

  // Update all goal progress
  const updateAllGoalProgress = () => {
    const updatedGoals = goals.map(goal => {
      const newCurrent = calculateGoalProgress(goal);
      const completed = newCurrent >= goal.target;
      return { ...goal, current: newCurrent, completed };
    });
    
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  return {
    goals,
    loading,
    updateGoal,
    createGoal,
    deleteGoal,
    updateAllGoalProgress,
    calculateGoalProgress
  };
};
