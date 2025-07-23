"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import { PublicProfile } from "@/components/PublicProfile";
import { FriendsList } from "@/components/FriendsList";
import { Leaderboard } from "@/components/Leaderboard";

import { UserIcon, UsersIcon, TrophyIcon } from "@heroicons/react/24/outline";

import { DatabaseService } from "@/services/databaseService";
import { UserProfile as UserProfileType } from "@/types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "friends" | "leaderboard"
  >("profile");

  // Unwrap the params Promise
  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!resolvedParams.username) return;
      setLoading(true);
      setError(null);
      try {
        const userProfile = await DatabaseService.getProfileByUsername(
          resolvedParams.username
        );
        if (userProfile) {
          setProfile(userProfile);
        } else {
          setError(
            "Profile not found. This user's profile may be private or does not exist."
          );
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("An error occurred while loading the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams.username]);

  const isOwnProfile = authUser?.uid === profile?.uid;
  const { userProfile: currentUserProfile } = useAuthContext();

  // Use live stats from AuthContext for own profile, Firebase data for others
  const displayStats =
    isOwnProfile && currentUserProfile?.stats
      ? currentUserProfile.stats
      : profile?.stats;

  if (loading || authLoading) {
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-xl font-medium text-white mb-2">
            Profile Not Found
          </h3>
          <p className="text-neutral-400 mb-6">
            {error || "This user's profile may be private or does not exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {isOwnProfile
            ? "Your Learning Profile"
            : `${profile.displayName}'s Profile`}
        </h1>
        <p className="text-neutral-400 text-lg">
          {isOwnProfile
            ? "Track your progress, connect with friends, and compete!"
            : `Check out ${profile.displayName}'s learning journey!`}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-blue-600 text-white"
              : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
          }`}
        >
          <UserIcon className="w-5 h-5" />
          Profile
        </button>

        {isOwnProfile && (
          <>
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "friends"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              Friends
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "leaderboard"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
              }`}
            >
              <TrophyIcon className="w-5 h-5" />
              Leaderboard
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && <PublicProfile userId={profile.uid} />}

      {isOwnProfile && activeTab === "friends" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <FriendsList userId={profile.uid} />
          <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                <span className="text-neutral-400">Profile Views</span>
                <span className="text-white font-medium">{0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                <span className="text-neutral-400">Total Learning Time</span>
                <span className="text-white font-medium">
                  {(Math.round((displayStats?.completedLearningTime || 0) / 60) /60).toFixed(2)}h
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                <span className="text-neutral-400">Videos Completed</span>
                <span className="text-white font-medium">
                  {displayStats?.completedVideos || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOwnProfile && activeTab === "leaderboard" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Leaderboard userId={profile.uid} />
          </div>
          <div className="space-y-6">
            {/* Personal Stats */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Points</span>
                  <span className="text-yellow-400 font-medium">{0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Learning Streak</span>
                  <span className="text-white font-medium">
                    {displayStats?.currentStreak || 0} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Weekly Goal</span>
                  <span className="text-green-400 font-medium">
                    {displayStats?.weeklyLearningTime
                      ? Math.round(
                          (displayStats.weeklyLearningTime / 300) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div className="glass-panel p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
              <h4 className="font-bold text-white mb-2">💪 Keep Going!</h4>
              <p className="text-sm text-purple-300 mb-3">
                You&apos;re making great progress! Complete more videos to climb
                higher on the leaderboard.
              </p>
              <div className="text-xs text-purple-400">
                Keep up the momentum!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
