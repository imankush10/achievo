
"use client";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { GoalSetting } from "@/components/GoalSetting";
import { AchievementShowcase } from "@/components/AchievementShowcase";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAchievements } from "@/hooks/useAchievements"; // Import the hook

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();

  // 1. Fetch all base data at the top level
  const { profile, loading: profileLoading } = usePublicProfile(user?.uid);
  const { playlists, loading: playlistsLoading } = usePlaylists();

  // 2. Pass fetched data into logic hooks
  const {
    goals,
    loading: goalsLoading,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useGoals(user?.uid, profile?.stats);

  // NEW: Call useAchievements here, passing in the fetched profile and playlists
  const {
    achievements,
    newlyUnlocked,
    dismissNewAchievements,
    getRarityColor,
    unlockedCount,
    totalCount,
    progress: achievementProgress,
  } = useAchievements(user?.uid, profile, playlists);

  // A single loading state for all children
  const isLoading =
    authLoading || profileLoading || playlistsLoading || goalsLoading;

  return (
    <div className="space-y-6 mb-8">
      <AnalyticsDashboard playlists={playlists} userId={user?.uid} />{" "}
      <div className="grid md:grid-cols-2 gap-6">
        <GoalSetting
          goals={goals}
          loading={isLoading}
          createGoal={createGoal}
          updateGoal={updateGoal}
          deleteGoal={deleteGoal}
        />

        {/* Pass the computed achievement data and functions down */}
        <AchievementShowcase
          achievements={achievements}
          newlyUnlocked={newlyUnlocked}
          dismissNewAchievements={dismissNewAchievements}
          getRarityColor={getRarityColor}
          unlockedCount={unlockedCount}
          totalCount={totalCount}
          progress={achievementProgress}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
