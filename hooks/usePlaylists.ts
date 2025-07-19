import { useState, useEffect, useRef } from 'react';
import { Playlist } from '@/types';
import { DatabaseService } from '@/services/database';

// Move migration service outside component to prevent recreating
const MigrationService = {
  async migrateLocalPlaylistsToUser(userId: string): Promise<void> {
    try {
      const localPlaylists = JSON.parse(localStorage.getItem('localPlaylists') || '[]');
      
      if (localPlaylists.length === 0) return;

      console.log(`Starting migration of ${localPlaylists.length} playlists for user ${userId}`);

      // Set a flag to indicate migration is in progress (BEFORE clearing localStorage)
      sessionStorage.setItem(`migration_${userId}`, 'in_progress');

      // Migrate each playlist to Firebase FIRST
      for (const playlist of localPlaylists) {
        const playlistData = {
          name: playlist.name || playlist.title || 'Untitled Playlist',
          description: playlist.description || '',
          videos: playlist.videos || [],
          thumbnailUrl: playlist.thumbnailUrl || '',
          totalDuration: playlist.totalDuration || 0,
          totalVideos: playlist.totalVideos || playlist.videos?.length || 0,
          completedDuration: playlist.completedDuration || 0
        };
        
        await DatabaseService.createPlaylist(userId, playlistData);
      }

      // Only clear localStorage AFTER successful migration
      localStorage.removeItem('localPlaylists');
      
      // Mark migration as completed for this user
      sessionStorage.setItem(`migration_${userId}`, 'completed');
      window.dispatchEvent(new Event('localPlaylistsUpdated'));
      
      console.log(`Successfully migrated ${localPlaylists.length} playlists to user account`);
    } catch (error) {
      console.error('Failed to migrate local playlists:', error);
      // On error, clear the in-progress flag but keep localStorage
      sessionStorage.removeItem(`migration_${userId}`);
      throw error;
    }
  },

  // Check if migration was already completed for this user
  isMigrationCompleted(userId: string): boolean {
    return sessionStorage.getItem(`migration_${userId}`) === 'completed';
  },

  // Check if migration is in progress
  isMigrationInProgress(userId: string): boolean {
    return sessionStorage.getItem(`migration_${userId}`) === 'in_progress';
  },

  // Clear migration status (for logout)
  clearMigrationStatus(userId: string): void {
    sessionStorage.removeItem(`migration_${userId}`);
  }
};

export const usePlaylists = (userId: string | undefined) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track migration state persistently
  const migrationAttempted = useRef<string | null>(null);
  const migrationInProgress = useRef(false);
  const previousUserId = useRef<string | undefined>(undefined);

  // Clear migration status when user logs out
  useEffect(() => {
    if (previousUserId.current && !userId) {
      // User logged out
      MigrationService.clearMigrationStatus(previousUserId.current);
      migrationAttempted.current = null;
      migrationInProgress.current = false;
    }
    previousUserId.current = userId;
  }, [userId]);

  // Handle migration when user signs in
  useEffect(() => {
    const handleMigration = async () => {
      if (!userId || migrationAttempted.current === userId || migrationInProgress.current) {
        return;
      }

      // Check if migration was already completed for this user
      if (MigrationService.isMigrationCompleted(userId)) {
        migrationAttempted.current = userId;
        return;
      }

      // Check if migration is already in progress
      if (MigrationService.isMigrationInProgress(userId)) {
        migrationAttempted.current = userId;
        return;
      }

      const localPlaylists = JSON.parse(localStorage.getItem('localPlaylists') || '[]');
      
      if (localPlaylists.length > 0) {
        migrationInProgress.current = true;
        migrationAttempted.current = userId;
        
        try {
          console.log(`Attempting migration for user ${userId}`);
          await MigrationService.migrateLocalPlaylistsToUser(userId);
        } catch (err) {
          console.error('Migration failed:', err);
          setError('Failed to migrate local playlists');
          // Reset migration attempt so it can be retried
          migrationAttempted.current = null;
        } finally {
          migrationInProgress.current = false;
        }
      } else {
        migrationAttempted.current = userId;
      }
    };

    handleMigration();
  }, [userId]);

  // Load playlists
  useEffect(() => {
    if (userId && !migrationInProgress.current) {
      // Authenticated user - use Firebase
      setLoading(true);
      const unsubscribe = DatabaseService.subscribeToUserPlaylists(userId, (newPlaylists) => {
        setPlaylists(newPlaylists);
        setLoading(false);
        setError(null);
      });
      return () => unsubscribe();
    } else if (!userId) {
      // Guest user - use localStorage
      const loadLocalPlaylists = () => {
        const localPlaylists = JSON.parse(localStorage.getItem('localPlaylists') || '[]');
        setPlaylists(localPlaylists);
        setLoading(false);
      };

      loadLocalPlaylists();

      const handleStorageUpdate = () => loadLocalPlaylists();
      window.addEventListener('localPlaylistsUpdated', handleStorageUpdate);
      
      return () => {
        window.removeEventListener('localPlaylistsUpdated', handleStorageUpdate);
      };
    } else {
      // Migration in progress, keep loading true
      setLoading(true);
    }
  }, [userId, migrationInProgress.current]);

  const createPlaylist = async (playlistData: Omit<Playlist, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Creating playlist with data:', playlistData); // Debug log
      
      if (userId) {
        await DatabaseService.createPlaylist(userId, playlistData);
      } else {
        const localPlaylists = JSON.parse(localStorage.getItem('localPlaylists') || '[]');
        const newPlaylist = {
          id: Date.now().toString(),
          userId: 'guest',
          // Handle both name and title fields
          name: playlistData.name || playlistData.title || 'Untitled Playlist',
          title: playlistData.name || playlistData.title, // Keep for backward compatibility
          description: playlistData.description || '',
          videos: playlistData.videos || [],
          thumbnailUrl: playlistData.thumbnailUrl || '',
          totalDuration: playlistData.totalDuration || 0,
          totalVideos: playlistData.totalVideos || (playlistData.videos?.length) || 0,
          completedDuration: playlistData.completedDuration || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        localPlaylists.push(newPlaylist);
        localStorage.setItem('localPlaylists', JSON.stringify(localPlaylists));
        
        setPlaylists(localPlaylists);
        window.dispatchEvent(new Event('localPlaylistsUpdated'));
      }
    } catch (error) {
      console.error('Error in createPlaylist:', error); // Debug log
      setError(error instanceof Error ? error.message : 'Failed to create playlist');
      throw error;
    }
  };

  const updatePlaylist = async (playlistId: string, updates: Partial<Playlist>) => {
    try {
      if (userId) {
        await DatabaseService.updatePlaylist(playlistId, updates);
      } else {
        const localPlaylists = JSON.parse(localStorage.getItem('localPlaylists') || '[]');
        const updatedPlaylists = localPlaylists.map((playlist: Playlist) =>
          playlist.id === playlistId ? { ...playlist, ...updates, updatedAt: new Date() } : playlist
        );
        localStorage.setItem('localPlaylists', JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
        window.dispatchEvent(new Event('localPlaylistsUpdated'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update playlist');
      throw error;
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      if (userId) {
        await DatabaseService.deletePlaylist(playlistId);
      } else {
        const localPlaylists = JSON.parse(localStorage.getItem('localPlaylists') || '[]');
        const filteredPlaylists = localPlaylists.filter((playlist: Playlist) => playlist.id !== playlistId);
        localStorage.setItem('localPlaylists', JSON.stringify(filteredPlaylists));
        setPlaylists(filteredPlaylists);
        window.dispatchEvent(new Event('localPlaylistsUpdated'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete playlist');
      throw error;
    }
  };

  const toggleVideoCompletion = async (playlistId: string, videoId: string, completed: boolean) => {
    try {
      if (userId) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
          const updatedVideos = playlist.videos.map(video =>
            video.id === videoId ? { ...video, completed } : video
          );
          await DatabaseService.updatePlaylist(playlistId, { videos: updatedVideos });
        }
      } else {
        const localPlaylists = JSON.parse(localStorage.getItem('localPlaylists') || '[]');
        const updatedPlaylists = localPlaylists.map((playlist: Playlist) => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              videos: playlist.videos.map(video =>
                video.id === videoId ? { ...video, completed } : video
              ),
              updatedAt: new Date()
            };
          }
          return playlist;
        });
        
        localStorage.setItem('localPlaylists', JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
        window.dispatchEvent(new Event('localPlaylistsUpdated'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update video status');
      throw error;
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
  };
};
