// src/utils/statsCalculator.ts
import { Playlist } from "@/types";

export interface UserStats {
  totalPlaylists: number;
  completedPlaylists: number;
  totalVideos: number;
  completedVideos: number;
  totalLearningTime: number; // in seconds
  completedLearningTime: number; // in seconds
  categoriesExplored: string[];
  // Additional stats that can be computed from playlists
  averageCompletionRate: number;
  totalPlaylistsWithProgress: number;
}

export function calculateStatsFromPlaylists(playlists: Playlist[]): UserStats {
  if (!playlists.length) {
    return {
      totalPlaylists: 0,
      completedPlaylists: 0,
      totalVideos: 0,
      completedVideos: 0,
      totalLearningTime: 0,
      completedLearningTime: 0,
      categoriesExplored: [],
      averageCompletionRate: 0,
      totalPlaylistsWithProgress: 0,
    };
  }

  const totalPlaylists = playlists.length;

  // Calculate completed playlists (playlists where all videos are completed)
  const completedPlaylists = playlists.filter(
    (p) => p.videos.length > 0 && p.videos.every((v) => v.completed)
  ).length;

  // Calculate total and completed videos
  const totalVideos = playlists.reduce((sum, p) => sum + p.videos.length, 0);
  const completedVideos = playlists.reduce(
    (sum, p) => sum + p.videos.filter((v) => v.completed).length,
    0
  );

  // Calculate learning time
  const totalLearningTime = playlists.reduce(
    (sum, p) => sum + p.totalDuration,
    0
  );
  const completedLearningTime = playlists.reduce(
    (sum, p) =>
      sum +
      p.videos
        .filter((v) => v.completed)
        .reduce((vSum, v) => vSum + v.durationInSeconds, 0),
    0
  );

  // Calculate categories explored
  const categoriesExplored = [
    ...new Set(playlists.flatMap((p) => p.categories || [])),
  ];

  // Calculate additional derived stats
  const averageCompletionRate =
    totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  const totalPlaylistsWithProgress = playlists.filter(
    (p) => p.videos.length > 0 && p.videos.some((v) => v.completed)
  ).length;

  return {
    totalPlaylists,
    completedPlaylists,
    totalVideos,
    completedVideos,
    totalLearningTime,
    completedLearningTime,
    categoriesExplored,
    averageCompletionRate,
    totalPlaylistsWithProgress,
  };
}
