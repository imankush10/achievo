import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import { useCategoryManager } from '@/hooks/useCategoryManager';

interface CategorySelectorProps {
  selectedCategories: string[];
  selectedTags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onCategoriesChange: (categories: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onDifficultyChange: (difficulty: 'beginner' | 'intermediate' | 'advanced' | undefined) => void;
  allPlaylists?: any[]; // For showing existing tags
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  selectedTags,
  difficulty,
  onCategoriesChange,
  onTagsChange,
  onDifficultyChange,
  allPlaylists = []
}) => {
  const [newTag, setNewTag] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);
  const { predefinedCategories, difficultyLevels, getAllUsedTags } = useCategoryManager();
  
  const existingTags = getAllUsedTags(allPlaylists);

  // ... (handler functions remain the same)
  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const removeCategory = (category: string) => {
    onCategoriesChange(selectedCategories.filter(c => c !== category));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      onTagsChange([...selectedTags, tag.trim()]);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
      setShowCustomTag(false);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = predefinedCategories.find(c => c.name === categoryName);
    return category?.color || 'bg-neutral-500';
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = predefinedCategories.find(c => c.name === categoryName);
    return category?.icon || '🏷️';
  };

  return (
    <div className="space-y-6">
      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-3">
          Difficulty Level
        </label>
        <div className="flex flex-wrap gap-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.level}
              type="button" // <-- FIX
              onClick={() => 
                onDifficultyChange(difficulty === level.level ? undefined : level.level as any)
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                difficulty === level.level
                  ? `${level.color} text-white`
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              <span>{level.icon}</span>
              <span>{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-3">
          Categories
        </label>
        
        {/* Selected Categories */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedCategories.map(category => (
              <span
                key={category}
                className={`px-3 py-1 ${getCategoryColor(category)} text-white rounded-full text-sm flex items-center gap-2`}
              >
                <span>{getCategoryIcon(category)}</span>
                <span>{category}</span>
                <button
                  type="button" // <-- FIX
                  onClick={() => removeCategory(category)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Predefined Categories */}
        <div className="flex flex-wrap gap-2">
          {predefinedCategories
            .filter(category => !selectedCategories.includes(category.name))
            .map(category => (
            <button
              key={category.name}
              type="button" // <-- FIX
              onClick={() => addCategory(category.name)}
              className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <PlusIcon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-3">
          Tags
        </label>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-full text-sm flex items-center gap-2"
              >
                <TagIcon className="w-3 h-3" />
                <span>{tag}</span>
                <button
                  type="button" // <-- FIX
                  onClick={() => removeTag(tag)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Existing Tags (from other playlists) */}
        {existingTags.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-neutral-500 mb-2">Existing tags:</p>
            <div className="flex flex-wrap gap-2">
              {existingTags
                .filter(tag => !selectedTags.includes(tag))
                .slice(0, 10) 
                .map(tag => (
                <button
                  key={tag}
                  type="button" // <-- FIX
                  onClick={() => addTag(tag)}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded text-xs transition-all duration-200 flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <PlusIcon className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Tag */}
        {showCustomTag ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
              placeholder="Enter custom tag..."
              className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
            />
            <button
              type="button" // <-- FIX
              onClick={addCustomTag}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              type="button" // <-- FIX
              onClick={() => {
                setShowCustomTag(false);
                setNewTag('');
              }}
              className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button" // <-- FIX
            onClick={() => setShowCustomTag(true)}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Custom Tag
          </button>
        )}
      </div>
    </div>
  );
};
