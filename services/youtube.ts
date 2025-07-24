import axios from "axios";
import { Video } from "@/types";

export class YouTubeService {
  static extractPlaylistId(url: string): string | null {
    try {
      const urlObject = new URL(url);
      const listId = urlObject.searchParams.get("list");

      // Check if it's a YouTube Mix/Radio playlist
      if (listId && listId.startsWith("RD")) {
        throw new Error("YouTube mixes are not supported. Please use regular playlists only.");
      }

      // Check if there's no playlist parameter but it might be a video URL
      if (!listId && (urlObject.searchParams.get("v") || urlObject.pathname.includes("/watch"))) {
        throw new Error("Individual videos are not supported. Please use playlist URLs only.");
      }

      // Check if there's no list parameter at all
      if (!listId) {
        throw new Error("Only YouTube playlists are supported. Please provide a valid playlist URL.");
      }

      return listId;
    } catch (error) {
      if (error instanceof Error && error.message.includes("supported")) {
        throw error; // Re-throw our custom errors
      }
      // This will catch any invalid URL formats that can't be parsed
      throw new Error("Invalid URL format. Please provide a valid YouTube playlist URL.");
    }
  }

  static async getPlaylistData(
    playlistId: string
  ): Promise<{ videos: Video[]; title: string }> {
    try {
      // This POST request points to the API route we just fixed.
      const response = await axios.post("/api/youtube/playlist", {
        playlistId,
      });
      return response.data;
    } catch (error: any) {
      // Throw the error message from the server's response
      const errorMessage =
        error.response?.data?.error || "Failed to fetch playlist data";
      // console.error("Error fetching playlist:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}
