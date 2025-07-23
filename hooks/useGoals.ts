import { useState, useEffect, useMemo, useCallback } from "react";
import { Goal, UserProfile } from "@/types";
import { DatabaseService } from "@/services/databaseService";

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

export const useGoals = (
  userId: string | undefined,
  stats: UserProfile["stats"] | undefined
) => {
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
    const fetchedGoals = await DatabaseService.getGoals(userId);

    if (fetchedGoals.length > 0) {
      setGoals(fetchedGoals);
    } else {
      // Create default goals for new users and save them
      const initialGoals = await Promise.all(
        defaultGoals.map(async (goal) => {
          const newId = await DatabaseService.createGoal(userId, {
            ...goal,
            createdAt: new Date(),
          });
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

  const createGoal = async (goalData: Omit<Goal, "id" | "createdAt">) => {
    if (!userId) return;
    const newId = await DatabaseService.createGoal(userId, {
      ...goalData,
      createdAt: new Date(),
    });
    const newGoal = { ...goalData, id: newId, createdAt: new Date() };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const updateGoal = async (
    goalId: string,
    updates: Partial<Omit<Goal, "id" | "createdAt">>
  ) => {
    if (!userId) return;
    await DatabaseService.updateGoal(userId, goalId, updates);
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g))
    );
  };

  const deleteGoal = async (goalId: string) => {
    if (!userId) return;
    await DatabaseService.deleteGoal(userId, goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const getGoalProgress = (goal: Goal, currentStats: UserProfile["stats"]) => {
    switch (goal.type) {
      case "weekly_hours":
        // Convert seconds to hours for comparison
        const weeklyHours = (currentStats.weeklyLearningTime || 0) / 3600;
        return { current: weeklyHours, target: goal.target };
      case "monthly_playlists":
        return {
          current: currentStats.monthlyCompletions || 0,
          target: goal.target,
        };
      case "daily_streak":
        return {
          current: currentStats.currentStreak || 0,
          target: goal.target,
        };
      default:
        return { current: 0, target: goal.target };
    }
  };

  const goalsWithProgress = useMemo(() => {
    if (!stats) return [];

    return goals.map((goal) => {
      const { current } = getGoalProgress(goal, stats);
      return {
        ...goal,
        current,
        completed: current >= goal.target,
      };
    });
  }, [goals, stats]);

  return {
    goals: goalsWithProgress,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
  };
};
