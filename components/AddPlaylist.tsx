import { useState } from "react";
import { YouTubeService } from "@/services/youtube";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "./Toast";
import { CategorySelector } from "./CategorySelector";
import {
  PlusIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export const AddPlaylist = () => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Category states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | undefined
  >();

  const { user } = useAuth();
  const { createPlaylist, playlists } = usePlaylists();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setLoading(true);

    try {
      const playlistId = YouTubeService.extractPlaylistId(playlistUrl);
      if (!playlistId) {
        // This will now handle invalid URLs, including mixes, gracefully.
        throw new Error("Invalid or unsupported YouTube playlist URL.");
      }

      // --- MODIFICATION START ---
      // This single API call is now wrapped in its own try...catch block
      // to handle specific API errors like "playlist not found".
      const { videos, title } = await YouTubeService.getPlaylistData(playlistId);
      // --- MODIFICATION END ---
      
      const totalDuration = videos.reduce(
        (sum, video) => sum + video.durationInSeconds,
        0
      );

      const playlistData = {
        name: title,
        description: "",
        playlistUrl,
        videos,
        thumbnailUrl: videos[0]?.thumbnailUrl || "",
        totalDuration,
        totalVideos: videos.length,
        completedDuration: 0,
        categories: selectedCategories,
        tags: selectedTags,
        ...(difficulty && { difficulty }),
      };

      await createPlaylist(playlistData);

      if (user) {
        showToast("Playlist added successfully!", "success");
      } else {
        showToast(
          "Playlist added! Sign in to save your progress permanently.",
          "warning",
          7000
        );
      }

      // Reset form
      setPlaylistUrl("");
      setSelectedCategories([]);
      setSelectedTags([]);
      setDifficulty(undefined);
      setShowAdvanced(false);

    } catch (error) {
      // This block will now catch errors from both extractPlaylistId and getPlaylistData
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      
      // Provide a more user-friendly message for the specific "not found" error.
      if (errorMessage.includes("cannot be found")) {
        showToast("Playlist not found. It may be private, unlisted, or deleted.", "error");
      } else {
        showToast(errorMessage, "error");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
          <PlusIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-200">
          Add New Playlist
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LinkIcon className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="url"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=..."
            className="w-full pl-12 pr-4 py-4 border border-neutral-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-neutral-700/50 text-neutral-100 placeholder-neutral-400 transition-all duration-200"
            disabled={loading}
          />
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
        >
          {showAdvanced ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
          </span>
        </button>

        {/* Advanced Options - Categories & Tags */}
        {showAdvanced && (
          <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
            <CategorySelector
              selectedCategories={selectedCategories}
              selectedTags={selectedTags}
              difficulty={difficulty}
              onCategoriesChange={setSelectedCategories}
              onTagsChange={setSelectedTags}
              onDifficultyChange={setDifficulty}
              allPlaylists={playlists}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !playlistUrl.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-neutral-600 disabled:to-neutral-700 text-white py-4 px-6 rounded-xl font-semibold disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Adding Playlist...</span>
            </div>
          ) : (
            "Add Playlist"
          )}
        </button>
      </form>
    </div>
  );
};
