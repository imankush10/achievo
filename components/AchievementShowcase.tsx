import React, { useState } from "react";
import {
  TrophyIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Achievement } from "@/types";

interface AchievementShowcaseProps {
  achievements: Achievement[];
  newlyUnlocked: Achievement[];
  dismissNewAchievements: () => void;
  getRarityColor: (rarity: Achievement["rarity"]) => string;
  unlockedCount: number;
  totalCount: number;
  progress: number;
  loading: boolean;
}

export const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({
  achievements,
  newlyUnlocked,
  dismissNewAchievements,
  getRarityColor,
  unlockedCount,
  totalCount,
  progress,
  loading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  const categories = [
    { id: "all", name: "All", icon: "🏆" },
    { id: "completion", name: "Completion", icon: "✅" },
    { id: "streak", name: "Streaks", icon: "🔥" },
    { id: "time", name: "Time", icon: "⏰" },
    { id: "exploration", name: "Exploration", icon: "🗺️" },
    { id: "special", name: "Special", icon: "⭐" },
  ];

  const filteredAchievements = achievements.filter((achievement) => {
    const categoryMatch =
      selectedCategory === "all" || achievement.category === selectedCategory;
    const unlockedMatch = !showOnlyUnlocked || achievement.unlocked;
    return categoryMatch && unlockedMatch;
  });

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({
    achievement,
  }) => {
    const progressPercentage = achievement.progress
      ? Math.min((achievement.progress / achievement.requirement) * 100, 100)
      : 0;

    return (
      <div
        className={`relative p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
          achievement.unlocked
            ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-lg"
            : "bg-neutral-800/50 border-neutral-700/50 hover:border-neutral-600/50"
        }`}
      >
        {/* Rarity Indicator */}
        <div
          className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getRarityColor(
            achievement.rarity
          )}`}
        />

        {/* Achievement Icon */}
        <div
          className={`text-4xl mb-3 ${
            achievement.unlocked ? "" : "grayscale opacity-50"
          }`}
        >
          {achievement.unlocked ? achievement.icon : "🔒"}
        </div>

        {/* Achievement Info */}
        <div className="mb-3">
          <h4
            className={`font-semibold mb-1 ${
              achievement.unlocked ? "text-white" : "text-neutral-500"
            }`}
          >
            {achievement.title}
          </h4>
          <p className="text-sm text-neutral-400 line-clamp-2">
            {achievement.description}
          </p>
        </div>

        {/* Progress Bar (for locked achievements) */}
        {!achievement.unlocked && achievement.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-neutral-500">Progress</span>
              <span className="text-xs text-neutral-400">
                {achievement.progress}/{achievement.requirement}
              </span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Rarity Badge */}
        <div
          className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getRarityColor(
            achievement.rarity
          )} text-white`}
        >
          {achievement.rarity}
        </div>

        {/* Unlock Date */}
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="mt-2 text-xs text-neutral-500">
            Unlocked {achievement.unlockedAt.toLocaleDateString()}
          </div>
        )}

        {/* Sparkle Effect for Unlocked */}
        {achievement.unlocked && (
          <div className="absolute -top-1 -right-1">
            <SparklesIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
        )}
      </div>
    );
  };

  const NewAchievementModal: React.FC = () => {
    if (newlyUnlocked.length === 0) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="glass-panel max-w-md w-full p-6 relative animate-modal-pop-in">
          <button
            onClick={dismissNewAchievements}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Achievement Unlocked!
            </h3>

            {newlyUnlocked.map((achievement, index) => (
              <div key={achievement.id} className="mb-4 last:mb-6">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  {achievement.title}
                </h4>
                <p className="text-sm text-neutral-400 mb-2">
                  {achievement.description}
                </p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getRarityColor(
                    achievement.rarity
                  )} text-white`}
                >
                  {achievement.rarity}
                </div>
              </div>
            ))}

            <button
              onClick={dismissNewAchievements}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
            >
              Awesome! 🎊
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-neutral-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <h3 className="text-xl font-bold text-white">Achievements</h3>
              <p className="text-sm text-neutral-400">
                {unlockedCount}/{totalCount} unlocked ({progress.toFixed(0)}%)
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white mb-1">
              {progress.toFixed(0)}%
            </div>
            <div className="w-24 bg-neutral-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Show Only Unlocked Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyUnlocked}
              onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                showOnlyUnlocked
                  ? "bg-blue-500 border-blue-500"
                  : "border-neutral-500 hover:border-blue-400"
              }`}
            >
              {showOnlyUnlocked && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="ml-3 text-sm text-neutral-300">
              Show only unlocked
            </span>
          </label>
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <h4 className="text-lg font-medium text-white mb-2">
              No achievements found
            </h4>
            <p className="text-neutral-400">
              {showOnlyUnlocked
                ? "You haven't unlocked any achievements in this category yet. Keep learning!"
                : "Try a different category or start learning to unlock achievements!"}
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(
            achievements.reduce((acc, achievement) => {
              if (achievement.unlocked) {
                acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>)
          ).map(([rarity, count]) => (
            <div
              key={rarity}
              className="text-center p-3 bg-neutral-800/50 rounded-lg"
            >
              <div
                className={`w-4 h-4 rounded-full mx-auto mb-2 ${getRarityColor(
                  rarity as Achievement["rarity"]
                )}`}
              />
              <div className="text-lg font-bold text-white">{count}</div>
              <div className="text-xs text-neutral-400 capitalize">
                {rarity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Achievement Modal */}
      <NewAchievementModal />
    </>
  );
};
