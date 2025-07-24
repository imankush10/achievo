import { useState } from "react";
import { Playlist } from "@/types";
import { VideoItem } from "./VideoItem";
import { YouTubeService } from "@/services/youtube";
import { usePlaylists } from "@/hooks/usePlaylists";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useCategoryManager } from "@/hooks/useCategoryManager";

interface PlaylistItemProps {
  playlist: Playlist;
  isSelected?: boolean;
  onSelectionChange?: (playlistId: string) => void;
  showSelection?: boolean;
}

export const PlaylistItem = ({
  playlist,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
}: PlaylistItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { deletePlaylist, toggleVideoCompletion } = usePlaylists();
  const { predefinedCategories, difficultyLevels } = useCategoryManager();

  const handleToggleVideo = async (videoId: string, completed: boolean) => {
    try {
      setIsUpdating(true);
      await toggleVideoCompletion(playlist.id, videoId, completed);
    } catch (error) {
      console.error("Failed to toggle video completion:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await deletePlaylist(playlist.id);
      } catch (error) {
        console.error("Failed to delete playlist:", error);
      }
    }
  };

  const handleSelectionChange = () => {
    if (onSelectionChange) {
      onSelectionChange(playlist.id);
    }
  };

  const completedVideos = playlist.videos.filter(
    (video) => video.completed
  ).length;
  const totalVideos = playlist.videos.length;
  const progressPercentage =
    totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  const completedDuration = playlist.videos
    .filter((video) => video.completed)
    .reduce((sum, video) => sum + video.durationInSeconds, 0);

  const remainingDuration = playlist.totalDuration - completedDuration;

  const getCategoryColor = (categoryName: string) => {
    const category = predefinedCategories.find((c) => c.name === categoryName);
    return category?.color || "bg-neutral-500";
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = predefinedCategories.find((c) => c.name === categoryName);
    return category?.icon || "🏷️";
  };

  const getDifficultyInfo = (level: string) => {
    const diff = difficultyLevels.find((d) => d.level === level);
    return diff || { icon: "❓", color: "bg-neutral-500", label: level };
  };

  return (
    <div
      className={`glass-panel p-6 group hover:shadow-xl transition-all duration-300 ${
        isUpdating ? "opacity-75" : ""
      } ${isSelected ? "ring-2 ring-blue-500/50 bg-blue-500/5" : ""}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-4 flex-1">
          {/* Selection checkbox */}
          {showSelection && (
            <div className="pt-1">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleSelectionChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-neutral-500 hover:border-blue-400"
                    }`}
                  >
                    {isSelected && (
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
                </div>
              </label>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <PlayIcon className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {playlist.name}
              </h3>
            </div>
            {(playlist.categories?.length > 0 ||
              playlist.tags?.length > 0 ||
              playlist.difficulty) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Difficulty Badge */}
                {playlist.difficulty && (
                  <span
                    className={`px-3 py-1 ${
                      getDifficultyInfo(playlist.difficulty).color
                    } text-white rounded-full text-xs font-medium flex items-center gap-1`}
                  >
                    <span>{getDifficultyInfo(playlist.difficulty).icon}</span>
                    <span>{getDifficultyInfo(playlist.difficulty).label}</span>
                  </span>
                )}

                {/* Categories */}
                {playlist.categories?.map((category) => (
                  <span
                    key={category}
                    className={`px-2 py-1 ${getCategoryColor(
                      category
                    )} text-white rounded-lg text-xs font-medium flex items-center gap-1`}
                  >
                    <span>{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                  </span>
                ))}

                {/* Tags */}
                {playlist.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded text-xs flex items-center gap-1"
                  >
                    <span>🏷️</span>
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-neutral-800/80 rounded-lg p-3 border border-neutral-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Progress</span>
                  <span className="text-sm font-medium text-white">
                    {completedVideos}/{totalVideos}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  videos completed
                </div>
              </div>

              <div className="bg-neutral-800/80 rounded-lg p-3 border border-neutral-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Remaining</span>
                  <span className="text-sm font-medium text-white">
                    {YouTubeService.formatDuration(remainingDuration)}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-1">time left</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDeletePlaylist}
          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200"
          disabled={isUpdating}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-6">
        <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div
          className="absolute -top-1 bg-neutral-800 px-2 py-1 rounded text-xs text-neutral-300 transform -translate-x-1/2"
          style={{ left: `${Math.min(Math.max(progressPercentage, 5), 95)}%` }}
        >
          {Math.round(progressPercentage)}%
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 group"
        disabled={isUpdating}
      >
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
        <span className="text-sm font-medium">
          {isExpanded ? "Hide Videos" : `Show ${totalVideos} Videos`}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
          {playlist.videos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              onToggleComplete={handleToggleVideo}
            />
          ))}
        </div>
      )}

      {isUpdating && (
        <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
