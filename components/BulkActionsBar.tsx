import React from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  TrashIcon,
  ArrowPathIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface BulkActionsBarProps {
  selectedCount: number;
  onMarkAllComplete: () => void;
  onMarkAllIncomplete: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onMarkAllComplete,
  onMarkAllIncomplete,
  onDeleteSelected,
  onClearSelection,
  isProcessing
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-panel px-6 py-4 rounded-2xl shadow-2xl border border-neutral-600/50">
        <div className="flex items-center gap-6">
          {/* Selection count */}
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedCount}
            </div>
            <span className="font-medium">
              {selectedCount === 1 ? '1 playlist selected' : `${selectedCount} playlists selected`}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Mark all complete */}
            <button
              onClick={onMarkAllComplete}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              title="Mark all videos as complete"
            >
              <CheckIcon className="w-4 h-4" />
              Complete All
            </button>

            {/* Reset progress */}
            <button
              onClick={onMarkAllIncomplete}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              title="Reset progress for all videos"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset Progress
            </button>

            {/* Delete selected */}
            <button
              onClick={onDeleteSelected}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              title="Delete selected playlists"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>

            {/* Clear selection */}
            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-600 hover:bg-neutral-700 disabled:bg-neutral-600/50 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              title="Clear selection"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-300">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};
