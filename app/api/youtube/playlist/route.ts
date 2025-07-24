import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Helper function to parse ISO 8601 duration format
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export async function POST(request: NextRequest) {
  if (!YOUTUBE_API_KEY) {
    console.error(
      "YOUTUBE_API_KEY is not defined in .env.local. This is a server-side error."
    );
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    const { playlistId } = await request.json();

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      );
    }

    // Explicitly block YouTube Mix/Radio playlists on the server.
    if (playlistId.startsWith("RD")) {
      return NextResponse.json(
        { error: "YouTube Mixes and Radio playlists are not supported." },
        { status: 400 }
      );
    }

    let allVideoIds: string[] = [];
    let nextPageToken: string | undefined = undefined;

    // 1. Fetch ALL video IDs from the playlist, handling pagination.
    // The YouTube API only returns 50 items at a time.
    do {
      const playlistItemsResponse = await axios.get(
        `${YOUTUBE_API_BASE}/playlistItems`,
        {
          params: {
            part: "snippet",
            playlistId,
            maxResults: 50,
            key: YOUTUBE_API_KEY,
            pageToken: nextPageToken,
          },
        }
      );

      const items = playlistItemsResponse.data.items;
      const ids = items.map((item: any) => item.snippet.resourceId.videoId);
      allVideoIds.push(...ids);

      nextPageToken = playlistItemsResponse.data.nextPageToken;
    } while (nextPageToken);

    if (allVideoIds.length === 0) {
      return NextResponse.json({
        videos: [],
        title: "Empty or Invalid Playlist",
      });
    }

    // 2. Fetch details for all videos in batches of 50.
    // The 'videos' endpoint can accept up to 50 IDs at once.
    const videoDetails = [];
    for (let i = 0; i < allVideoIds.length; i += 50) {
      const videoIdsBatch = allVideoIds.slice(i, i + 50);
      const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          part: "contentDetails,snippet",
          id: videoIdsBatch.join(","),
          key: YOUTUBE_API_KEY,
        },
      });
      videoDetails.push(...videosResponse.data.items);
    }

    // 3. Fetch the playlist's title in a separate call.
    const playlistInfoResponse = await axios.get(
      `${YOUTUBE_API_BASE}/playlists`,
      {
        params: {
          part: "snippet",
          id: playlistId,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    const playlistTitle =
      playlistInfoResponse.data.items[0]?.snippet.title || "Unknown Playlist";

    // Create a map to preserve the original order of videos from the playlist.
    const orderMap = new Map(allVideoIds.map((id, index) => [id, index]));

    const videos = videoDetails
      .map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        duration: video.contentDetails.duration,
        durationInSeconds: parseDuration(video.contentDetails.duration),
        thumbnailUrl:
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default.url,
        completed: false,
        order: orderMap.get(video.id) ?? -1,
      }))
      .sort((a, b) => a.order - b.order); // Sort to guarantee original order.

    return NextResponse.json({
      videos,
      title: playlistTitle,
    });
  } catch (error: any) {
    // This provides detailed error feedback in your server logs (terminal).
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "YouTube API Error Response:",
        JSON.stringify(error.response.data, null, 2)
      );
      const apiError = error.response.data.error;
      const errorMessage =
        apiError.errors?.[0]?.message ||
        "Failed to fetch playlist data from YouTube.";
      return NextResponse.json(
        { error: errorMessage },
        { status: apiError.code || 500 }
      );
    }

    console.error("Generic Server Error in playlist API route:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
