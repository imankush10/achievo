import React, { useMemo } from "react";
import {
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { calculateStatsFromPlaylists } from "@/utils/statsCalculator";
import {
  getStreakData,
  getTimeUntilStreakExpires,
} from "@/utils/streakCalculator";
import { useAuthContext } from "@/context/AuthContext";
import { Playlist } from "@/types";

interface AnalyticsDashboardProps {
  playlists: Playlist[];
  userId?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  playlists,
  userId,
}) => {
  const { userProfile } = useAuthContext();

  // Use live stats from userProfile (automatically updated by usePlaylists)
  // Fall back to calculating from playlists if userProfile not available (e.g., guest users)
  const stats = useMemo(() => {
    const baseStats =
      userProfile?.stats || calculateStatsFromPlaylists(playlists);

    // Calculate averageCompletionRate if not present (for userProfile.stats)
    if (!("averageCompletionRate" in baseStats)) {
      const averageCompletionRate =
        baseStats.totalVideos > 0
          ? (baseStats.completedVideos / baseStats.totalVideos) * 100
          : 0;

      return {
        ...baseStats,
        averageCompletionRate,
        totalPlaylistsWithProgress: playlists.filter((p) =>
          p.videos.some((v) => v.completed)
        ).length,
      };
    }

    return baseStats;
  }, [userProfile?.stats, playlists]);

  // Get streak data from local storage
  const streakData = useMemo(
    () => getStreakData(userProfile?.uid || userId),
    [userProfile?.uid, userId]
  );

  // Calculate time until streak expires
  const timeLeft = useMemo(
    () => getTimeUntilStreakExpires(streakData.lastActivityDate),
    [streakData.lastActivityDate]
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
            Your Learning Analytics
          </h2>

          {/* Streak Counter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/50 rounded-lg px-4 py-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">
                  {streakData.currentStreak}
                </div>
                <div className="text-xs text-orange-300">day streak</div>
              </div>
            </div>

            {timeLeft && (
              <div className="text-xs text-neutral-400">
                Keep streak alive in {timeLeft.hours}h {timeLeft.minutes}m
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Learning Time */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-neutral-400">Total Time</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatTime(stats.completedLearningTime)}
            </div>
            <div className="text-xs text-neutral-500">
              of {formatTime(stats.totalLearningTime)} total
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm text-neutral-400">Completion</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.averageCompletionRate.toFixed(0)}%
            </div>
            <div className="text-xs text-neutral-500">
              {stats.completedVideos}/{stats.totalVideos} videos
            </div>
          </div>

          {/* Playlists Completed */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
            <div className="flex items-center gap-3 mb-2">
              <TrophyIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-neutral-400">Completed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.completedPlaylists}
            </div>
            <div className="text-xs text-neutral-500">
              of {stats.totalPlaylists} playlists
            </div>
          </div>

          {/* Categories Explored */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDaysIcon className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-neutral-400">Categories</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.categoriesExplored.length}
            </div>
            <div className="text-xs text-neutral-500">topics explored</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-400">Overall Progress</span>
            <span className="text-sm font-medium text-white">
              {stats.averageCompletionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.averageCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Categories */}
        {stats.categoriesExplored.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">
              Learning Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.categoriesExplored.map((category: string) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
