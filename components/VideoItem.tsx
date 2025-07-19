import { Video } from '@/types';
import { YouTubeService } from '@/services/youtube';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface VideoItemProps {
  video: Video;
  onToggleComplete: (videoId: string, completed: boolean) => void;
}

export const VideoItem = ({ video, onToggleComplete }: VideoItemProps) => {
  return (
    <div className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
      video.completed 
        ? 'bg-neutral-800/30 border-neutral-700/50 opacity-75' 
        : 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600/50'
    }`}>
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
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-20 h-14 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
            {YouTubeService.formatDuration(video.durationInSeconds)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm leading-tight mb-1 ${
            video.completed ? 'line-through text-neutral-500' : 'text-white'
          }`}>
            {video.title}
          </h4>
          <div className="flex items-center space-x-2 text-xs text-neutral-400">
            <ClockIcon className="w-3 h-3" />
            <span>{YouTubeService.formatDuration(video.durationInSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
