import { useState, useEffect, useMemo, useCallback } from "react";
import { Goal, UserProfile } from "@/types";
import { usePublicProfile } from "./usePublicProfile";
import { GoalService } from "@/services/goalService";

// Default goals for new users remain the same
const defaultGoals: Omit<Goal, "id" | "createdAt">[] = [
  {
    type: "weekly_hours",
    title: "Weekly Learning Goal",
    description: "Complete learning hours each week",
    target: 5,
    unit: "hours",
  },
  {
    type: "monthly_playlists",
    title: "Monthly Playlist Goal",
    description: "Finish complete playlists each month",
    target: 2,
    unit: "playlists",
  },
  {
    type: "daily_streak",
    title: "Learning Streak",
    description: "Maintain a 7-day learning streak",
    target: 7,
    unit: "days",
  },
];

export const useGoals = (userId: string | undefined) => {
  const { profile, loading: profileLoading } = usePublicProfile(userId);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load goals from Firebase
  const loadGoals = useCallback(async () => {
    if (!userId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchedGoals = await GoalService.getGoals(userId);

    if (fetchedGoals.length > 0) {
      setGoals(fetchedGoals);
    } else {
      // Create default goals for new users and save them
      const initialGoals = await Promise.all(
        defaultGoals.map(async (goal) => {
          const newId = await GoalService.createGoal(userId, { ...goal, createdAt: new Date() });
          return { ...goal, id: newId, createdAt: new Date() };
        })
      );
      setGoals(initialGoals);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const newId = await GoalService.createGoal(userId, { ...goalData, createdAt: new Date() });
    const newGoal = { ...goalData, id: newId, createdAt: new Date() };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = async (goalId: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    if (!userId) return;
    await GoalService.updateGoal(userId, goalId, updates);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  const deleteGoal = async (goalId: string) => {
    if (!userId) return;
    await GoalService.deleteGoal(userId, goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // REFACTORED: This function now uses the 'stats' object from the user's profile
  const getGoalProgress = (goal: Goal, stats: UserProfile['stats']) => {
    switch (goal.type) {
      case "weekly_hours":
        // Convert seconds to hours for comparison
        const weeklyHours = (stats.weeklyLearningTime || 0) / 3600;
        return { current: weeklyHours, target: goal.target };
      case "monthly_playlists":
        return { current: stats.monthlyCompletions || 0, target: goal.target };
      case "daily_streak":
        return { current: stats.currentStreak || 0, target: goal.target };
      default:
        return { current: 0, target: goal.target };
    }
  };

  // NEW: A memoized list of goals with their current progress calculated
  const goalsWithProgress = useMemo(() => {
    if (!profile) return [];

    return goals.map(goal => {
      const { current } = getGoalProgress(goal, profile.stats);
      return {
        ...goal,
        current,
        completed: current >= goal.target,
      };
    });
  }, [goals, profile]);

  return {
    goals: goalsWithProgress, // Return goals with calculated progress
    loading: loading || profileLoading,
    createGoal,
    updateGoal,
    deleteGoal,
  };
};
