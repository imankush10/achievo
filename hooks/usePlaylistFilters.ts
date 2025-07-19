import { useState, useMemo } from 'react';
import { Playlist } from '@/types';

interface FilterOptions {
  searchTerm: string;
  status: 'all' | 'completed' | 'in-progress' | 'not-started';
  duration: 'all' | 'short' | 'medium' | 'long';
  category: string; // NEW: Category filter
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced'; // NEW: Difficulty filter
  sortBy: 'name' | 'created' | 'progress' | 'duration';
  sortOrder: 'asc' | 'desc';
}

export const usePlaylistFilters = (playlists: Playlist[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: 'all',
    duration: 'all',
    category: '', // NEW
    difficulty: 'all', // NEW
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const filteredPlaylists = useMemo(() => {
    let result = [...playlists];

    // Search filter
    if (filters.searchTerm) {
      result = result.filter(playlist => 
        playlist.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        playlist.categories?.some(cat => cat.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        playlist.tags?.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(playlist => {
        const completedVideos = playlist.videos.filter(v => v.completed).length;
        const totalVideos = playlist.videos.length;
        
        switch (filters.status) {
          case 'completed':
            return completedVideos === totalVideos && totalVideos > 0;
          case 'in-progress':
            return completedVideos > 0 && completedVideos < totalVideos;
          case 'not-started':
            return completedVideos === 0;
          default:
            return true;
        }
      });
    }

    // Duration filter
    if (filters.duration !== 'all') {
      result = result.filter(playlist => {
        const hours = playlist.totalDuration / 3600;
        switch (filters.duration) {
          case 'short':
            return hours < 1;
          case 'medium':
            return hours >= 1 && hours <= 4;
          case 'long':
            return hours > 4;
          default:
            return true;
        }
      });
    }

    // NEW: Category filter
    if (filters.category) {
      result = result.filter(playlist => 
        playlist.categories?.includes(filters.category)
      );
    }

    // NEW: Difficulty filter
    if (filters.difficulty !== 'all') {
      result = result.filter(playlist => 
        playlist.difficulty === filters.difficulty
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'progress':
          const aProgress = (a.videos.filter(v => v.completed).length / a.videos.length) * 100;
          const bProgress = (b.videos.filter(v => v.completed).length / b.videos.length) * 100;
          comparison = aProgress - bProgress;
          break;
        case 'duration':
          comparison = a.totalDuration - b.totalDuration;
          break;
        default:
          return 0;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [playlists, filters]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      duration: 'all',
      category: '', // NEW
      difficulty: 'all', // NEW
      sortBy: 'created',
      sortOrder: 'desc'
    });
  };

  return {
    filters,
    filteredPlaylists,
    updateFilter,
    clearFilters,
    totalResults: filteredPlaylists.length,
    totalPlaylists: playlists.length
  };
};
