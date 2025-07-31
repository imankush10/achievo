// src/components/VideoItem.tsx

import { useState } from 'react'; // <-- Import useState
import { Video } from '@/types';
import { YouTubeService } from '@/services/youtube';
import { CheckIcon, ClockIcon, FilmIcon, PlayCircleIcon, PencilIcon } from '@heroicons/react/24/outline'; // <-- Import PencilIcon
import Image from 'next/image';

interface VideoItemProps {
  video: Video;
  onToggleComplete: (videoId: string, completed: boolean) => void;
  onPlay?: (video: Video) => void;
  isYoutube: boolean;
  // --- NEW PROP for renaming ---
  onUpdateDetails: (videoId: string, updates: Partial<Video>) => Promise<void>;
}

export const VideoItem = ({ video, onToggleComplete, onPlay, isYoutube, onUpdateDetails }: VideoItemProps) => {
  // --- NEW STATE for inline editing ---
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(video.title);

  const handleRename = async () => {
    if (newTitle.trim() && newTitle.trim() !== video.title) {
      try {
        await onUpdateDetails(video.id, { title: newTitle.trim() });
      } catch (error) {
        console.error("Failed to rename video:", error);
      }
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        video.completed
          ? 'bg-neutral-800/30 border-neutral-700/50 opacity-75'
          : 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600/50'
      }`}
    >
      <div className="flex items-center p-4">
        <button
          onClick={() => onToggleComplete(video.id, !video.completed)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
            video.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-neutral-500 hover:border-green-400 hover:bg-green-400/10'
          }`}
        >
          {video.completed && <CheckIcon className="w-4 h-4" />}
        </button>

        <div className="relative flex-shrink-0 mr-4">
          <button
            type="button"
            className="focus:outline-none"
            tabIndex={-1}
            onClick={onPlay ? () => onPlay(video) : undefined}
            disabled={!isYoutube}
            aria-label="Play video"
          >
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                width={80}
                height={56}
                className="w-20 h-14 object-cover rounded-lg bg-neutral-700"
                unoptimized
              />
            ) : (
              <div className="w-20 h-14 rounded-lg bg-neutral-700/50 flex items-center justify-center">
                <FilmIcon className="w-8 h-8 text-neutral-500" />
              </div>
            )}
            {isYoutube && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/40 rounded-lg transition group-hover:bg-black/30">
                <PlayCircleIcon className="w-8 h-8 text-white/80 opacity-80 pointer-events-none" />
              </span>
            )}
          </button>
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
            {YouTubeService.formatDuration(video.durationInSeconds)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* --- MODIFICATION: Conditional rendering for rename --- */}
          {isEditing ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="w-full text-sm font-medium bg-transparent border-b border-blue-500 text-white focus:outline-none"
              autoFocus
            />
          ) : (
            <h4 className={`font-medium text-sm leading-tight mb-1 ${
              video.completed ? 'line-through text-neutral-500' : 'text-white'
            }`}>
              {video.title}
            </h4>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-neutral-400 mt-1">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-3 h-3" />
              <span>{YouTubeService.formatDuration(video.durationInSeconds)}</span>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-neutral-500 hover:text-white">
              <PencilIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
