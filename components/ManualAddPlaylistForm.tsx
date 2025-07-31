// src/components/ManualAddPlaylistForm.tsx

"use client";
import { useState } from "react";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useToast } from "./Toast"; 
import { parseDurationToSeconds } from "@/utils/durationParser";
import { Video } from "@/types";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ManualAddPlaylistFormProps {
  onClose: () => void;
}

export const ManualAddPlaylistForm = ({ onClose }: ManualAddPlaylistFormProps) => {
  const { createPlaylist } = usePlaylists();
  const { showToast } = useToast();
  const [playlistName, setPlaylistName] = useState("");
  const [videos, setVideos] = useState([{ title: "", duration: "", videoUrl: "" }]);
  const [loading, setLoading] = useState(false);

  const handleVideoChange = (index: number, field: string, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setVideos(newVideos);
  };

  const addVideoField = () => {
    setVideos([...videos, { title: "", duration: "", videoUrl: "" }]);
  };

  const removeVideoField = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim() || videos.some(v => !v.title.trim() || !v.duration.trim())) {
      showToast("Please fill in playlist name and all video titles/durations.", "error");
      return;
    }

    setLoading(true);
    try {
      const formattedVideos: Video[] = videos.map((v, index) => ({
        id: `${Date.now()}-${index}`, // Simple unique ID
        title: v.title.trim(),
        durationInSeconds: parseDurationToSeconds(v.duration),
        videoUrl: v.videoUrl?.trim() || undefined,
        completed: false,
        thumbnailUrl: "", // No thumbnail for manually added videos
      }));

      const totalDuration = formattedVideos.reduce((sum, v) => sum + v.durationInSeconds, 0);

      await createPlaylist({
        name: playlistName.trim(),
        videos: formattedVideos,
        totalDuration,
        totalVideos: formattedVideos.length,
        playlistUrl: "", // Indicates it's a manual playlist
        thumbnailUrl: "",
        description: "Manually added playlist",
        categories: [],
        tags: [],
        completedDuration: 0,
      });

      showToast("Manual playlist created successfully!", "success");
      onClose();
    } catch (error) {
      showToast("Failed to create playlist.", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div 
        className="glass-panel w-full max-w-2xl p-8 rounded-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Create a Manual Playlist</h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Playlist Name</label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="e.g., Data Structures Course"
              className="input-style w-full" // Use your standard input style
            />
          </div>

          <h3 className="text-lg font-semibold text-white pt-4 border-t border-neutral-700">Videos</h3>
          {videos.map((video, index) => (
            <div key={index} className="flex items-end gap-3 p-3 bg-neutral-800/50 rounded-lg">
              <div className="flex-grow space-y-2">
                <input
                  type="text"
                  placeholder={`Video ${index + 1} Title`}
                  value={video.title}
                  onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                  className="input-style w-full text-sm"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Duration (MM:SS)"
                    value={video.duration}
                    onChange={(e) => handleVideoChange(index, "duration", e.target.value)}
                    className="input-style w-1/2 text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Optional YouTube Link"
                    value={video.videoUrl}
                    onChange={(e) => handleVideoChange(index, "videoUrl", e.target.value)}
                    className="input-style w-1/2 text-sm"
                  />
                </div>
              </div>
              <button type="button" onClick={() => removeVideoField(index)} className="p-2 text-red-400 hover:bg-red-500/20 rounded">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addVideoField} className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
            <PlusIcon className="w-5 h-5" /> Add Video
          </button>
        </form>
        <div className="flex gap-4 mt-6 pt-6 border-t border-neutral-700">
          <button type="button" onClick={onClose} className="btn-secondary w-full">Cancel</button>
          <button type="submit" onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? "Creating..." : "Create Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
};
