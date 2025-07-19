import { useState, useMemo } from 'react';
import { Playlist } from '@/types';

export const useBulkSelection = (playlists: Playlist[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedPlaylists = useMemo(() => {
    return playlists.filter(playlist => selectedIds.has(playlist.id));
  }, [playlists, selectedIds]);

  const isSelected = (playlistId: string) => selectedIds.has(playlistId);

  const toggleSelection = (playlistId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
  };

  const selectAll = (playlistIds: string[]) => {
    setSelectedIds(new Set(playlistIds));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectAll = (availablePlaylistIds: string[]) => {
    if (selectedIds.size === availablePlaylistIds.length) {
      selectNone();
    } else {
      selectAll(availablePlaylistIds);
    }
  };

  return {
    selectedIds,
    selectedPlaylists,
    selectedCount: selectedIds.size,
    isSelected,
    toggleSelection,
    selectAll,
    selectNone,
    toggleSelectAll,
    hasSelection: selectedIds.size > 0
  };
};
