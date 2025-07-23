import React, { useEffect, useState } from "react";
import {
  UserIcon,
  CalendarDaysIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  ShareIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAchievements } from "@/hooks/useAchievements";
import { Playlist } from "@/types";

interface PublicProfileProps {
  userId?: string;
}
const EMPTY_PLAYLISTS: Playlist[] = [];

export const PublicProfile: React.FC<PublicProfileProps> = ({ userId }) => {
  const { profile, loading, isOwn, updateProfile, toggleProfileVisibility } =
    usePublicProfile(userId);
  const { achievements } = useAchievements(userId, EMPTY_PLAYLISTS);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      displayName: editForm.displayName,
      bio: editForm.bio,
    });
    setIsEditing(false);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/profile/${profile?.username}`;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName}'s Learning Profile`,
        text: "Check out my learning progress!",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Profile link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-neutral-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-neutral-700 rounded w-32"></div>
              <div className="h-4 bg-neutral-700 rounded w-48"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-panel p-6 text-center">
        <UserIcon className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">
          Profile not found
        </h3>
        <p className="text-neutral-400">
          This user's profile is private or doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              {profile.avatar || "👤"}
            </div>

            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    className="text-2xl font-bold bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-neutral-300 text-sm"
                    placeholder="Tell everyone about your learning journey..."
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {profile.displayName}
                  </h2>
                  <p className="text-neutral-400 mb-2">{profile.bio}</p>
                </>
              )}

              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Joined {profile.joinedDate.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  {profile.isPublic ? (
                    <>
                      <EyeIcon className="w-4 h-4" />
                      Public Profile
                    </>
                  ) : (
                    <>
                      <EyeSlashIcon className="w-4 h-4" />
                      Private Profile
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="flex items-center gap-2">
            {profile.isPublic && (
              <button
                onClick={handleShare}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Share profile"
              >
                <ShareIcon className="w-4 h-4" />
              </button>
            )}

            {isOwn && (
              <>
                <button
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                >
                  {isEditing ? "Save" : "Edit Profile"}
                </button>

                <button
                  onClick={toggleProfileVisibility}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    profile.isPublic
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-neutral-600 hover:bg-neutral-700 text-white"
                  }`}
                >
                  {profile.isPublic ? "Make Private" : "Make Public"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {profile.stats.totalPlaylists}
            </div>
            <div className="text-xs text-neutral-400">Playlists</div>
          </div>

          <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {profile.stats.completedPlaylists}
            </div>
            <div className="text-xs text-neutral-400">Completed</div>
          </div>

          <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-1">
              <FireIcon className="w-5 h-5 text-orange-400" />
              {profile.stats.currentStreak}
            </div>
            <div className="text-xs text-neutral-400">Day Streak</div>
          </div>

          <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {formatTime(profile.stats.completedLearningTime)}
            </div>
            <div className="text-xs text-neutral-400">Learning Time</div>
          </div>
        </div>

        {/* Categories */}
        {profile.stats.categoriesExplored.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-400 mb-3">
              Learning Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.stats.categoriesExplored.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievements Showcase */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-yellow-500" />
          Recent Achievements
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements
            .filter((a) => a.unlocked)
            .slice(0, 8)
            .map((achievement) => (
              <div
                key={achievement.id}
                className="p-3 bg-neutral-800/50 rounded-lg text-center hover:bg-neutral-700/50 transition-colors"
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs text-white font-medium">
                  {achievement.title}
                </div>
              </div>
            ))}
        </div>

        {achievements.filter((a) => a.unlocked).length === 0 && (
          <div className="text-center py-6 text-neutral-500">
            <TrophyIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No achievements yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
