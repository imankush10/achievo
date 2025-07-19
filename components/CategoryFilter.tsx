import React from 'react';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { Playlist } from '@/types';

interface CategoryFilterProps {
  playlists: Playlist[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  playlists,
  selectedCategory,
  onCategoryChange
}) => {
  const { predefinedCategories, getAllUsedCategories, getCategoryStats } = useCategoryManager();
  
  const usedCategories = getAllUsedCategories(playlists);
  const categoryStats = getCategoryStats(playlists);
  
  const getCategoryColor = (categoryName: string) => {
    const category = predefinedCategories.find(c => c.name === categoryName);
    return category?.color || 'bg-neutral-500';
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = predefinedCategories.find(c => c.name === categoryName);
    return category?.icon || '🏷️';
  };

  if (usedCategories.length === 0) return null;

  return (
    <div className="glass-panel p-4 mb-4">
      <h3 className="text-sm font-medium text-neutral-300 mb-3">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {/* All categories option */}
        <button
          onClick={() => onCategoryChange('')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            selectedCategory === ''
              ? 'bg-white text-black'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          <span>📋</span>
          <span>All ({playlists.length})</span>
        </button>

        {/* Category buttons */}
        {usedCategories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category === selectedCategory ? '' : category)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === category
                ? `${getCategoryColor(category)} text-white`
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            <span>{getCategoryIcon(category)}</span>
            <span>{category}</span>
            <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs">
              {categoryStats[category] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
