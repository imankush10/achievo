import React from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  ArrowsUpDownIcon 
} from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  durationFilter: string;
  onDurationChange: (duration: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  totalResults: number;
  totalPlaylists: number;
  onClearFilters: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  durationFilter,
  onDurationChange,
  sortBy,
  sortOrder,
  onSortChange,
  totalResults,
  totalPlaylists,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || durationFilter !== 'all';

  return (
    <div className="glass-panel p-6 mb-6">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search playlists..."
          className="w-full pl-10 pr-4 py-3 border border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-neutral-700/50 text-neutral-100 placeholder-neutral-400 transition-all duration-200"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1 text-neutral-400">
            <FunnelIcon className="h-4 w-4" />
            <span className="text-sm">Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="completed">✅ Completed</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="not-started">⭕ Not Started</option>
          </select>

          {/* Duration Filter */}
          <select
            value={durationFilter}
            onChange={(e) => onDurationChange(e.target.value)}
            className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Any Duration</option>
            <option value="short">⚡ Short (&lt; 1hr)</option>
            <option value="medium">⏳ Medium (1-4hrs)</option>
            <option value="long">📚 Long (&gt; 4hrs)</option>
          </select>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <ArrowsUpDownIcon className="h-4 w-4 text-neutral-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                onSortChange(newSortBy, newSortOrder);
              }}
              className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="created-desc">📅 Newest First</option>
              <option value="created-asc">📅 Oldest First</option>
              <option value="name-asc">🔤 Name A-Z</option>
              <option value="name-desc">🔤 Name Z-A</option>
              <option value="progress-desc">📊 Most Progress</option>
              <option value="progress-asc">📊 Least Progress</option>
              <option value="duration-desc">⏱️ Longest First</option>
              <option value="duration-asc">⏱️ Shortest First</option>
            </select>
          </div>
        </div>

        {/* Results & Clear */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">
            Showing <span className="text-white font-medium">{totalResults}</span> of{' '}
            <span className="text-white font-medium">{totalPlaylists}</span> playlists
          </span>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-600/50 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
