import React from 'react';

interface SelectionHeaderProps {
  totalCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  showBulkActions: boolean;
}

export const SelectionHeader: React.FC<SelectionHeaderProps> = ({
  totalCount,
  selectedCount,
  onToggleSelectAll,
  showBulkActions
}) => {
  if (!showBulkActions || totalCount === 0) return null;

  const allSelected = selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="glass-panel p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={onToggleSelectAll}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                allSelected 
                  ? 'bg-blue-500 border-blue-500' 
                  : someSelected
                  ? 'bg-blue-500/50 border-blue-500'
                  : 'border-neutral-500 hover:border-blue-400'
              }`}>
                {allSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {someSelected && !allSelected && (
                  <div className="w-2 h-2 bg-white rounded-sm" />
                )}
              </div>
            </div>
            <span className="ml-3 text-sm text-neutral-200">
              {allSelected 
                ? 'Deselect all' 
                : someSelected 
                ? `Select all (${selectedCount}/${totalCount} selected)`
                : 'Select all'
              }
            </span>
          </label>
        </div>

        {selectedCount > 0 && (
          <div className="text-sm text-neutral-400">
            {selectedCount} of {totalCount} playlists selected
          </div>
        )}
      </div>
    </div>
  );
};
