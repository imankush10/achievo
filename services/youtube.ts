import axios from "axios";
import { Video } from "@/types";

export class YouTubeService {
  static extractPlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
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
      console.error("Error fetching playlist:", errorMessage);
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
