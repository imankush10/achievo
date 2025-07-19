import { Playlist } from '@/types';

export const useCategoryManager = () => {
  // Predefined categories for quick selection
  const predefinedCategories = [
    { name: 'Programming', icon: '💻', color: 'bg-blue-500' },
    { name: 'Design', icon: '🎨', color: 'bg-purple-500' },
    { name: 'Business', icon: '💼', color: 'bg-green-500' },
    { name: 'Language', icon: '🗣️', color: 'bg-yellow-500' },
    { name: 'Music', icon: '🎵', color: 'bg-pink-500' },
    { name: 'Cooking', icon: '👨‍🍳', color: 'bg-orange-500' },
    { name: 'Fitness', icon: '💪', color: 'bg-red-500' },
    { name: 'Photography', icon: '📸', color: 'bg-indigo-500' },
    { name: 'Marketing', icon: '📈', color: 'bg-teal-500' },
    { name: 'Science', icon: '🧪', color: 'bg-cyan-500' },
  ];

  const difficultyLevels = [
    { level: 'beginner', label: 'Beginner', icon: '🌱', color: 'bg-green-500' },
    { level: 'intermediate', label: 'Intermediate', icon: '🌿', color: 'bg-yellow-500' },
    { level: 'advanced', label: 'Advanced', icon: '🌳', color: 'bg-red-500' },
  ];

  const getAllUsedTags = (playlists: Playlist[]): string[] => {
    const allTags = playlists.flatMap(playlist => [
      ...(playlist.categories || []),
      ...(playlist.tags || [])
    ]);
    return [...new Set(allTags)].sort();
  };

  const getAllUsedCategories = (playlists: Playlist[]): string[] => {
    const allCategories = playlists.flatMap(playlist => playlist.categories || []);
    return [...new Set(allCategories)].sort();
  };

  const getCategoryStats = (playlists: Playlist[]) => {
    const stats: Record<string, number> = {};
    playlists.forEach(playlist => {
      (playlist.categories || []).forEach(category => {
        stats[category] = (stats[category] || 0) + 1;
      });
    });
    return stats;
  };

  const filterPlaylistsByCategory = (playlists: Playlist[], category: string) => {
    return playlists.filter(playlist => 
      playlist.categories?.includes(category)
    );
  };

  const filterPlaylistsByTag = (playlists: Playlist[], tag: string) => {
    return playlists.filter(playlist => 
      playlist.categories?.includes(tag) || playlist.tags?.includes(tag)
    );
  };

  return {
    predefinedCategories,
    difficultyLevels,
    getAllUsedTags,
    getAllUsedCategories,
    getCategoryStats,
    filterPlaylistsByCategory,
    filterPlaylistsByTag
  };
};
