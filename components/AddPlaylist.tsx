import { useState } from 'react';
import { YouTubeService } from '@/services/youtube';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from './Toast';
import { PlusIcon, LinkIcon } from '@heroicons/react/24/outline';

export const AddPlaylist = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { createPlaylist } = usePlaylists(user?.uid);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setLoading(true);

    try {
      const playlistId = YouTubeService.extractPlaylistId(playlistUrl);
      if (!playlistId) {
        throw new Error('Invalid YouTube playlist URL');
      }

      // Use the new single API call
      const { videos, title } = await YouTubeService.getPlaylistData(playlistId);

      const totalDuration = videos.reduce((sum, video) => sum + video.durationInSeconds, 0);

      const playlistData = {
        name: title, // Changed from 'title' to 'name'
        description: '', // Add description field
        playlistUrl,
        videos,
        thumbnailUrl: videos[0]?.thumbnailUrl || '', // Add thumbnail from first video
        totalDuration,
        totalVideos: videos.length, // Add totalVideos field
        completedDuration: 0,
      };

      // This now works for both authenticated and guest users
      await createPlaylist(playlistData);
      
      if (user) {
        showToast('Playlist added successfully!', 'success');
      } else {
        showToast('Playlist added! Sign in to save your progress permanently.', 'warning', 7000);
      }

      setPlaylistUrl('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add playlist';
      showToast(errorMessage, 'error');
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
        <h2 className="text-2xl font-bold text-neutral-200">Add New Playlist</h2>
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
            'Add Playlist'
          )}
        </button>
      </form>
    </div>
  );
};
