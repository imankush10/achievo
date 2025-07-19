  'use client';

  import { Header } from '@/components/Header';
  import { AddPlaylist } from '@/components/AddPlaylist';
  import { PlaylistItem } from '@/components/PlaylistItem';
  import { useAuth } from '@/hooks/useAuth';
  import { usePlaylists } from '@/hooks/usePlaylists';

  export default function Home() {
    const { user, loading: authLoading } = useAuth();
    const { playlists, loading, error } = usePlaylists(user?.uid);

    // Show loading spinner only while checking authentication
    if (authLoading) {
      return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
          </div>
        </div>
      );
    }

    // Always render the app - both for authenticated and guest users
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        {/* Content starts after header with proper spacing */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <AddPlaylist />
          
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
              </div>
            </div>
          )}
          
          {error && (
            <div className="glass-panel border-red-500/50 mb-6">
              <div className="flex items-center space-x-3 p-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}
          
          {!loading && playlists.length === 0 && (
            <div className="glass-panel text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-neutral-300 mb-2">No playlists yet</h3>
              <p className="text-neutral-500">
                {user 
                  ? "Add your first playlist above to get started" 
                  : "Add a playlist above to get started. Sign in to save your progress!"
                }
              </p>
            </div>
          )}
          
          <div className="grid gap-6">
            {playlists.map((playlist) => (
              <PlaylistItem key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </div>
      </div>
    );
  }
