import { useState, useEffect, useMemo } from "react";
import { UserProfile, Playlist, Achievement } from "@/types";
import { DatabaseService } from "@/services/databaseService";

const allAchievements: Omit<
  Achievement,
  "unlocked" | "unlockedAt" | "progress"
>[] = [
  {
    id: "first_video",
    title: "First Steps",
    description: "Complete your first video",
    icon: "🎯",
    rarity: "common",
    category: "completion",
    requirement: 1,
  },
  {
    id: "first_playlist",
    title: "Playlist Pioneer",
    description: "Complete your first playlist",
    icon: "✅",
    rarity: "uncommon",
    category: "completion",
    requirement: 1,
  },
  {
    id: "playlist_collector",
    title: "Playlist Collector",
    description: "Complete 5 playlists",
    icon: "📚",
    rarity: "rare",
    category: "completion",
    requirement: 5,
  },
  {
    id: "learning_master",
    title: "Learning Master",
    description: "Complete 10 playlists",
    icon: "🏆",
    rarity: "epic",
    category: "completion",
    requirement: 10,
  },

  // Streak Achievements
  {
    id: "week_streak",
    title: "Consistency Champion",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    rarity: "uncommon",
    category: "streak",
    requirement: 7,
  },
  {
    id: "month_streak",
    title: "Dedication Warrior",
    description: "Maintain a 30-day learning streak",
    icon: "⚡",
    rarity: "epic",
    category: "streak",
    requirement: 30,
  },
  {
    id: "legendary_streak",
    title: "Legendary Learner",
    description: "Maintain a 100-day learning streak",
    icon: "👑",
    rarity: "legendary",
    category: "streak",
    requirement: 100,
  },

  // Time Achievements
  {
    id: "ten_hours",
    title: "Time Invested",
    description: "Complete 10 hours of learning",
    icon: "⏰",
    rarity: "uncommon",
    category: "time",
    requirement: 36000, // 10 hours in seconds
  },
  {
    id: "hundred_hours",
    title: "Dedicated Scholar",
    description: "Complete 100 hours of learning",
    icon: "📖",
    rarity: "epic",
    category: "time",
    requirement: 360000, // 100 hours in seconds
  },

  // Exploration Achievements
  {
    id: "category_explorer",
    title: "Knowledge Explorer",
    description: "Learn from 5 different categories",
    icon: "🗺️",
    rarity: "rare",
    category: "exploration",
    requirement: 5,
  },
  {
    id: "renaissance_learner",
    title: "Renaissance Learner",
    description: "Learn from 10 different categories",
    icon: "🎨",
    rarity: "legendary",
    category: "exploration",
    requirement: 10,
  },

  // Special Achievements
  {
    id: "speed_runner",
    title: "Speed Runner",
    description: "Complete a playlist in one day",
    icon: "💨",
    rarity: "rare",
    category: "special",
    requirement: 1,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Complete videos after midnight",
    icon: "🦉",
    rarity: "uncommon",
    category: "special",
    requirement: 5,
  },
];

export const useAchievements = (
  userId: string | undefined,
  profile: UserProfile | null,
  playlists: Playlist[]
) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const calculateAchievementProgress = (
    achievement: Omit<Achievement, "unlocked" | "unlockedAt" | "progress">,
    stats: UserProfile["stats"]
  ) => {
    switch (achievement.id) {
      case "first_video":
        return Math.min(stats.completedVideos, achievement.requirement);
      case "first_playlist":
      case "playlist_collector":
      case "learning_master":
        return Math.min(stats.completedPlaylists, achievement.requirement);
      case "week_streak":
      case "month_streak":
      case "legendary_streak":
        return Math.min(stats.currentStreak, achievement.requirement);
      case "ten_hours":
      case "hundred_hours":
        return Math.min(stats.completedLearningTime, achievement.requirement);
      case "category_explorer":
      case "renaissance_learner":
        return Math.min(
          stats.categoriesExplored.length,
          achievement.requirement
        );
      default:
        return 0;
    }
  };

  const currentAchievements = useMemo(() => {
    if (!profile || !playlists) return [];

    const stats = profile.stats;
    if (!stats) return [];

    return allAchievements.map((achievementDef) => {
      const progress = calculateAchievementProgress(achievementDef, stats);
      const unlocked = progress >= achievementDef.requirement;
      const isAlreadyUnlockedInDb = profile.unlockedAchievements?.includes(
        achievementDef.id
      );

      return {
        ...achievementDef,
        progress,
        unlocked: isAlreadyUnlockedInDb || unlocked,
        unlockedAt: isAlreadyUnlockedInDb
          ? profile.unlockedAchievements?.[achievementDef.id]?.date
          : undefined,
      };
    });
  }, [profile, playlists]);

  useEffect(() => {
    if (!profile || !userId) return;

    const newlyUnlockedAchievements = currentAchievements.filter(
      (ach) => ach.unlocked && !profile.unlockedAchievements?.includes(ach.id)
    );

    if (newlyUnlockedAchievements.length > 0) {
      const newIds = newlyUnlockedAchievements.map((ach) => ach.id);

      DatabaseService.unlockAchievements(userId, newIds)
        .then(() => {
          console.log("New achievements unlocked and saved:", newIds);
          setNewlyUnlocked(newlyUnlockedAchievements);
        })
        .catch((error) => {
          console.error("Failed to save new achievements:", error);
        });
    }

    setAchievements(currentAchievements);
  }, [currentAchievements, profile, userId]);

  const dismissNewAchievements = () => {
    setNewlyUnlocked([]);
  };

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500";
      case "uncommon":
        return "bg-green-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const unlockedCount = useMemo(
    () => currentAchievements.filter((a) => a.unlocked).length,
    [currentAchievements]
  );
  const totalCount = allAchievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return {
    achievements: currentAchievements,
    newlyUnlocked,
    dismissNewAchievements,
    getRarityColor,
    unlockedCount,
    totalCount,
    progress,
  };
};
