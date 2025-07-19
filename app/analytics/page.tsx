"use client"
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { GoalSetting } from '@/components/GoalSetting';
import { AchievementShowcase } from '@/components/AchievementShowcase';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useAuth } from '@/hooks/useAuth';

export default function AnalyticsPage() {
  const { user } = useAuth();
    const { playlists } =
      usePlaylists(user?.uid);
  return (
    <div className="space-y-6 mb-8">
      <AnalyticsDashboard playlists={playlists} userId={user?.uid} />

      <div className="grid md:grid-cols-2 gap-6">
        <GoalSetting playlists={playlists} userId={user?.uid} />
        <AchievementShowcase playlists={playlists} userId={user?.uid} />
      </div>
    </div>
  );
}
