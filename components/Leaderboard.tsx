import React, { useState } from 'react';
import { 
  TrophyIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  MinusIcon,
  FireIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';

interface LeaderboardProps {
  userId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ userId }) => {
  const { 
    weeklyLeaderboard, 
    monthlyLeaderboard, 
    allTimeLeaderboard, 
    loading,
    refreshLeaderboards 
  } = useLeaderboard(userId);
  
  const [activeTimeframe, setActiveTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');

  const getCurrentLeaderboard = () => {
    switch (activeTimeframe) {
      case 'weekly': return weeklyLeaderboard;
      case 'monthly': return monthlyLeaderboard;
      case 'all-time': return allTimeLeaderboard;
      default: return weeklyLeaderboard;
    }
  };

  const currentLeaderboard = getCurrentLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return <ArrowUpIcon className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDownIcon className="w-4 h-4 text-red-400" />;
      case 'same': return <MinusIcon className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-600/20 to-orange-700/20 border-orange-600/30';
    return 'from-neutral-800/50 to-neutral-800/30 border-neutral-700/50';
  };

  const LeaderboardEntry: React.FC<{ entry: LeaderboardEntry; timeframe: string }> = ({ 
    entry, 
    timeframe 
  }) => {
    const isCurrentUser = entry.isCurrentUser;

    return (
      <div className={`relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 ring-2 ring-blue-500/30' 
          : `bg-gradient-to-r ${getRankColor(entry.rank)} hover:border-neutral-600/50`
      }`}>
        {/* Current User Badge */}
        {isCurrentUser && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            You
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Rank */}
            <div className={`text-2xl font-bold min-w-[3rem] text-center ${
              entry.rank <= 3 ? 'text-3xl' : 'text-white'
            }`}>
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-3xl">{entry.avatar || '👤'}</div>
              <div>
                <h4 className={`font-semibold ${isCurrentUser ? 'text-blue-200' : 'text-white'}`}>
                  {entry.displayName}
                </h4>
                <div className="flex items-center gap-4 text-xs text-neutral-400 mt-1">
                  <span className="flex items-center gap-1">
                    <FireIcon className="w-3 h-3" />
                    {entry.streak} streak
                  </span>
                  {timeframe !== 'all-time' && (
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {entry.weeklyHours}h this week
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <TrophyIcon className="w-3 h-3" />
                    {entry.totalAchievements} achievements
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Score and Trend */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-lg font-bold ${
                isCurrentUser ? 'text-blue-200' : 'text-white'
              }`}>
                {entry.score.toLocaleString()}
              </span>
              {getTrendIcon(entry.trend)}
            </div>
            <div className="text-xs text-neutral-400">
              {timeframe === 'weekly' && 'weekly points'}
              {timeframe === 'monthly' && 'monthly points'}  
              {timeframe === 'all-time' && 'total points'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-700 rounded w-1/3"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 w-20 bg-neutral-700 rounded"></div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-neutral-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrophyIcon className="w-8 h-8 text-yellow-500" />
          <div>
            <h3 className="text-xl font-bold text-white">Leaderboard</h3>
            <p className="text-sm text-neutral-400">
              {currentLeaderboard?.totalParticipants} learners competing
            </p>
          </div>
        </div>

        <button
          onClick={refreshLeaderboards}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-all duration-200"
          title="Refresh leaderboard"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex gap-2 mb-6">
        {(['weekly', 'monthly', 'all-time'] as const).map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setActiveTimeframe(timeframe)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTimeframe === timeframe
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {timeframe === 'weekly' && <CalendarDaysIcon className="w-4 h-4" />}
            {timeframe === 'monthly' && <CalendarDaysIcon className="w-4 h-4" />}
            {timeframe === 'all-time' && <TrophyIcon className="w-4 h-4" />}
            <span className="capitalize">
              {timeframe === 'all-time' ? 'All Time' : timeframe}
            </span>
          </button>
        ))}
      </div>

      {/* User's Current Rank (if not in top 10) */}
      {currentLeaderboard?.userRank && currentLeaderboard.userRank > 10 && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-center">
            <span className="text-sm text-blue-300">Your current rank: </span>
            <span className="text-lg font-bold text-blue-200">
              #{currentLeaderboard.userRank}
            </span>
            <span className="text-sm text-blue-300"> of {currentLeaderboard.totalParticipants}</span>
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      {currentLeaderboard ? (
        <div className="space-y-3">
          {currentLeaderboard.entries.slice(0, 10).map((entry) => (
            <LeaderboardEntry 
              key={entry.userId} 
              entry={entry} 
              timeframe={activeTimeframe}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <TrophyIcon className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-white mb-2">No leaderboard data</h4>
          <p className="text-neutral-400">Start learning to compete with others!</p>
        </div>
      )}

      {/* Last Updated */}
      {currentLeaderboard && (
        <div className="mt-6 pt-4 border-t border-neutral-700/50">
          <p className="text-xs text-neutral-500 text-center">
            Last updated {currentLeaderboard.lastUpdated.toLocaleString()}
          </p>
        </div>
      )}

      {/* Motivational Messages */}
      {currentLeaderboard?.userRank && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
          <div className="text-center">
            {currentLeaderboard.userRank === 1 && (
              <p className="text-sm text-yellow-300">🎉 You're leading the pack! Keep it up, champion!</p>
            )}
            {currentLeaderboard.userRank <= 3 && currentLeaderboard.userRank > 1 && (
              <p className="text-sm text-blue-300">🔥 You're in the top 3! Push harder to reach #1!</p>
            )}
            {currentLeaderboard.userRank <= 10 && currentLeaderboard.userRank > 3 && (
              <p className="text-sm text-green-300">⭐ Top 10! You're doing amazing, keep climbing!</p>
            )}
            {currentLeaderboard.userRank > 10 && (
              <p className="text-sm text-purple-300">💪 Keep learning to climb the ranks! You've got this!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
