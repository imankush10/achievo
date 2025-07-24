"use client";

import { useState } from "react";
import { AddPlaylist } from "@/components/AddPlaylist";
import { PlaylistItem } from "@/components/PlaylistItem";
import { SearchBar } from "@/components/SearchBar";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { SelectionHeader } from "@/components/SelectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { usePlaylists } from "@/hooks/usePlaylists";
import { usePlaylistFilters } from "@/hooks/usePlaylistFilters";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { playlists, loading, error, updatePlaylist, deletePlaylist } =
    usePlaylists(user?.uid);
  const {
    filters,
    filteredPlaylists,
    updateFilter,
    clearFilters,
    totalResults,
    totalPlaylists,
  } = usePlaylistFilters(playlists);

  const {
    selectedPlaylists,
    selectedCount,
    isSelected,
    toggleSelection,
    selectNone,
    toggleSelectAll,
  } = useBulkSelection(filteredPlaylists);

  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [showBulkMode, setShowBulkMode] = useState(false);

  // Bulk action handlers
  const handleMarkAllComplete = async () => {
    setIsProcessingBulk(true);
    try {
      for (const playlist of selectedPlaylists) {
        const updatedVideos = playlist.videos.map((video) => ({
          ...video,
          completed: true,
        }));
        const completedDuration = playlist.totalDuration;

        await updatePlaylist(playlist.id, {
          videos: updatedVideos,
          completedDuration,
        });
      }
      selectNone();
    } catch (error) {
      console.error("Failed to mark playlists as complete:", error);
      alert("Failed to update some playlists. Please try again.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleMarkAllIncomplete = async () => {
    setIsProcessingBulk(true);
    try {
      for (const playlist of selectedPlaylists) {
        const updatedVideos = playlist.videos.map((video) => ({
          ...video,
          completed: false,
        }));

        await updatePlaylist(playlist.id, {
          videos: updatedVideos,
          completedDuration: 0,
        });
      }
      selectNone();
    } catch (error) {
      console.error("Failed to reset playlist progress:", error);
      alert("Failed to reset some playlists. Please try again.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleDeleteSelected = async () => {
    const confirmMessage = `Are you sure you want to delete ${selectedCount} playlist${
      selectedCount > 1 ? "s" : ""
    }? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      setIsProcessingBulk(true);
      try {
        for (const playlist of selectedPlaylists) {
          await deletePlaylist(playlist.id);
        }
        selectNone();
      } catch (error) {
        console.error("Failed to delete playlists:", error);
        alert("Failed to delete some playlists. Please try again.");
      } finally {
        setIsProcessingBulk(false);
      }
    }
  };

  const handleToggleBulkMode = () => {
    setShowBulkMode(!showBulkMode);
    if (showBulkMode) {
      selectNone();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
            style={{ animationDuration: "0.8s" }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <AddPlaylist />

      <div className="text-center my-8">
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-neutral-700"></div>
          <div className="relative px-4 bg-neutral-900 text-neutral-500 text-sm">
            OR
          </div>
        </div>
        <div className="mt-6">
          <Link
            href="/local-course"
            className="inline-flex items-center justify-center gap-3 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-200 py-4 px-8 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <ComputerDesktopIcon className="w-6 h-6 text-purple-400" />
            <span>Track a Local Course from Your Computer</span>
          </Link>
        </div>
      </div>

      {!loading && playlists.length > 0 && (
        <>
         
          <CategoryFilter
            playlists={playlists}
            selectedCategory={filters.category}
            onCategoryChange={(category) => updateFilter("category", category)}
          />

          <SearchBar
            searchTerm={filters.searchTerm}
            onSearchChange={(term) => updateFilter("searchTerm", term)}
            statusFilter={filters.status}
            onStatusChange={(status) => updateFilter("status", status)}
            durationFilter={filters.duration}
            onDurationChange={(duration) => updateFilter("duration", duration)}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={(sortBy, sortOrder) => {
              updateFilter("sortBy", sortBy);
              updateFilter("sortOrder", sortOrder);
            }}
            totalResults={totalResults}
            totalPlaylists={totalPlaylists}
            onClearFilters={clearFilters}
          />
          <div className="flex mb-4">
            <button
              onClick={handleToggleBulkMode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showBulkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
              }`}
            >
              {showBulkMode ? "Exit Bulk Mode" : "Bulk Actions"}
            </button>
          </div>
           <SelectionHeader
            totalCount={filteredPlaylists.length}
            selectedCount={selectedCount}
            onToggleSelectAll={() =>
              toggleSelectAll(filteredPlaylists.map((p) => p.id))
            }
            showBulkActions={showBulkMode}
          />
        </>
      )}

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
              style={{ animationDuration: "0.8s" }}
            />
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

      {!loading && (
        <>
          {playlists.length === 0 ? (
            <div className="glass-panel text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-neutral-300 mb-2">
                No playlists yet
              </h3>
              <p className="text-neutral-500">
                {user
                  ? "Add your first playlist above to get started"
                  : "Add a playlist above to get started. Sign in to save your progress!"}
              </p>
            </div>
          ) : filteredPlaylists.length === 0 ? (
            <div className="glass-panel text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-neutral-300 mb-2">
                No playlists found
              </h3>
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
            <div className="grid gap-6">
              {filteredPlaylists.map((playlist) => (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  isSelected={isSelected(playlist.id)}
                  onSelectionChange={toggleSelection}
                  showSelection={showBulkMode}
                />
              ))}
            </div>
          )}
        </>
      )}

      <BulkActionsBar
        selectedCount={selectedCount}
        onMarkAllComplete={handleMarkAllComplete}
        onMarkAllIncomplete={handleMarkAllIncomplete}
        onDeleteSelected={handleDeleteSelected}
        onClearSelection={selectNone}
        isProcessing={isProcessingBulk}
      />
    </>
  );
}
