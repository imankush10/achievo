import { useState, useEffect } from "react";
import { Playlist } from "@/types";
import { DatabaseService } from "@/services/databaseService";
import { useAuthContext } from "@/context/AuthContext";
import { calculateStatsFromPlaylists } from "@/utils/statsCalculator";
import { updateStreak } from "@/utils/streakCalculator";

export const usePlaylists = (userId?: string) => {
  const { user, migrationCompleted } = useAuthContext();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    if (user && migrationCompleted) {
      // User is logged in and migration is complete, subscribe to Firebase
      const unsubscribe = DatabaseService.subscribeToUserPlaylists(
        user.uid,
        (newPlaylists) => {
          setPlaylists(newPlaylists);
          setLoading(false);
          setError(null);
        }
      );
      return () => unsubscribe();
    } else if (!user) {
      // User is a guest, use localStorage
      if (typeof window !== "undefined") {
        const loadLocalPlaylists = () => {
          const localData = JSON.parse(
            localStorage.getItem("localPlaylists") || "[]"
          );
          setPlaylists(localData);
          setLoading(false);
        };

        loadLocalPlaylists();

        // Listen for local changes
        const handleStorageUpdate = () => {
          const updatedData = JSON.parse(
            localStorage.getItem("localPlaylists") || "[]"
          );
          setPlaylists(updatedData);
        };

        window.addEventListener("localPlaylistsUpdated", handleStorageUpdate);
        return () =>
          window.removeEventListener(
            "localPlaylistsUpdated",
            handleStorageUpdate
          );
      }
    } else {
      // User is logged in but migration is in progress, keep loading
      setLoading(true);
    }
  }, [user, migrationCompleted]);

  // Update user stats when playlists change (for authenticated users only)
  useEffect(() => {
    if (user && playlists.length > 0 && !loading && migrationCompleted) {
      // Calculate stats using the centralized utility
      const stats = calculateStatsFromPlaylists(playlists);

      DatabaseService.updateUserStats(user.uid, stats).catch(
        (error: unknown) => {
          console.error("Failed to update user stats:", error);
        }
      );
    }
  }, [playlists, user, loading, migrationCompleted]);

  const createPlaylist = async (
    playlistData: Omit<Playlist, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (user) {
        await DatabaseService.createPlaylist(user.uid, playlistData);
      } else {
        // Handle localStorage for guest users
        if (typeof window !== "undefined") {
          const localPlaylists = JSON.parse(
            localStorage.getItem("localPlaylists") || "[]"
          );
          const newPlaylist = {
            id: Date.now().toString(),
            userId: "guest",
            ...playlistData,
            name: playlistData.name || "Untitled Playlist",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          localPlaylists.push(newPlaylist);
          localStorage.setItem("localPlaylists", JSON.stringify(localPlaylists));
          setPlaylists(localPlaylists);
          window.dispatchEvent(new Event("localPlaylistsUpdated"));
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create playlist";
      setError(errorMessage);
      throw error;
    }
  };

  const updatePlaylist = async (
    playlistId: string,
    updates: Partial<Playlist>
  ) => {
    try {
      if (user) {
        await DatabaseService.updatePlaylist(playlistId, updates);
      } else {
        if (typeof window !== "undefined") {
          const localPlaylists = JSON.parse(
            localStorage.getItem("localPlaylists") || "[]"
          );
          const updatedPlaylists = localPlaylists.map((playlist: Playlist) =>
            playlist.id === playlistId
              ? { ...playlist, ...updates, updatedAt: new Date() }
              : playlist
          );
          localStorage.setItem(
            "localPlaylists",
            JSON.stringify(updatedPlaylists)
          );
          setPlaylists(updatedPlaylists);
          window.dispatchEvent(new Event("localPlaylistsUpdated"));
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update playlist";
      setError(errorMessage);
      throw error;
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      if (user) {
        await DatabaseService.deletePlaylist(playlistId);
      } else {
        if (typeof window !== "undefined") {
          const localPlaylists = JSON.parse(
            localStorage.getItem("localPlaylists") || "[]"
          );
          const filteredPlaylists = localPlaylists.filter(
            (playlist: Playlist) => playlist.id !== playlistId
          );
          localStorage.setItem(
            "localPlaylists",
            JSON.stringify(filteredPlaylists)
          );
          setPlaylists(filteredPlaylists);
          window.dispatchEvent(new Event("localPlaylistsUpdated"));
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete playlist";
      setError(errorMessage);
      throw error;
    }
  };

  const toggleVideoCompletion = async (
    playlistId: string,
    videoId: string,
    completed: boolean
  ) => {
    try {
      if (user) {
        const playlist = playlists.find((p) => p.id === playlistId);
        if (playlist) {
          const updatedVideos = playlist.videos.map((video) =>
            video.id === videoId ? { ...video, completed } : video
          );
          await DatabaseService.updatePlaylist(playlistId, {
            videos: updatedVideos,
          });

          // Update streak when a video is completed
          if (completed) {
            updateStreak(user.uid);
          }
        }
      } else {
        if (typeof window !== "undefined") {
          const localPlaylists = JSON.parse(
            localStorage.getItem("localPlaylists") || "[]"
          );
          const updatedPlaylists = localPlaylists.map((playlist: Playlist) => {
            if (playlist.id === playlistId) {
              return {
                ...playlist,
                videos: playlist.videos.map((video) =>
                  video.id === videoId ? { ...video, completed } : video
                ),
                updatedAt: new Date(),
              };
            }
            return playlist;
          });

          localStorage.setItem(
            "localPlaylists",
            JSON.stringify(updatedPlaylists)
          );
          setPlaylists(updatedPlaylists);
          window.dispatchEvent(new Event("localPlaylistsUpdated"));

          // Update streak for guest users too
          if (completed) {
            updateStreak();
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update video status";
      setError(errorMessage);
      throw error;
    }
  };

  const updateVideoDetails = async (
    playlistId: string,
    videoId: string,
    updates: Partial<Video>
  ) => {
    try {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) throw new Error("Playlist not found");

      const updatedVideos = playlist.videos.map((video) =>
        video.id === videoId ? { ...video, ...updates } : video
      );

      // We use the existing updatePlaylist function to save the changes
      await updatePlaylist(playlistId, { videos: updatedVideos });
    } catch (error) {
      console.error("Failed to update video details:", error);
      throw error; // Re-throw to be handled by the component
    }
  };

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    toggleVideoCompletion,
    updateVideoDetails,
  };
};
