'use client';

import { Header } from '@/components/Header';
import { AddPlaylist } from '@/components/AddPlaylist';
import { PlaylistItem } from '@/components/PlaylistItem';
import { SearchBar } from '@/components/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePlaylistFilters } from '@/hooks/usePlaylistFilters';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { playlists, loading, error } = usePlaylists(user?.uid);
  const {
    filters,
    filteredPlaylists,
    updateFilter,
    clearFilters,
    totalResults,
    totalPlaylists
  } = usePlaylistFilters(playlists);

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
        
        {/* Show search bar only if there are playlists */}
        {!loading && playlists.length > 0 && (
          <SearchBar
            searchTerm={filters.searchTerm}
            onSearchChange={(term) => updateFilter('searchTerm', term)}
            statusFilter={filters.status}
            onStatusChange={(status) => updateFilter('status', status)}
            durationFilter={filters.duration}
            onDurationChange={(duration) => updateFilter('duration', duration)}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={(sortBy, sortOrder) => {
              updateFilter('sortBy', sortBy);
              updateFilter('sortOrder', sortOrder);
            }}
            totalResults={totalResults}
            totalPlaylists={totalPlaylists}
            onClearFilters={clearFilters}
          />
        )}
        
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
        
        {/* Handle different states for playlists */}
        {!loading && (
          <>
            {playlists.length === 0 ? (
              // No playlists at all
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
            ) : filteredPlaylists.length === 0 ? (
              // Has playlists but none match the filter
              <div className="glass-panel text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-neutral-300 mb-2">No playlists found</h3>
                <p className="text-neutral-500 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              // Show filtered playlists
              <div className="grid gap-6">
                {filteredPlaylists.map((playlist) => (
                  <PlaylistItem key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
