"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PublicProfile } from "@/components/PublicProfile";
import { FriendsList } from "@/components/FriendsList";
import { Leaderboard } from "@/components/Leaderboard";
import {
  UserIcon,
  UsersIcon,
  TrophyIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useFriends } from "@/hooks/useFriends";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "friends" | "leaderboard"
  >("profile");

  const { profile, loading: profileLoading } = usePublicProfile(user?.uid);
  const { friends, loading: friendsLoading } = useFriends(user?.uid);
  const { weeklyLeaderboard, loading: leaderboardLoading } = useLeaderboard(
    user?.uid
  );

  const userRank = weeklyLeaderboard?.entries.find(
    (e) => e.isCurrentUser
  )?.rank;
  const weeklyLeader = weeklyLeaderboard?.entries[0]?.displayName;
  const weeklyPoints = weeklyLeaderboard?.entries.find(
    (e) => e.isCurrentUser
  )?.score;
  const weeklyGoalProgress = profile?.stats?.weeklyLearningTime
    ? (profile.stats.weeklyLearningTime / 5) * 100
    : 0;

  if (
    authLoading ||
    (user && (profileLoading || friendsLoading || leaderboardLoading))
  ) {
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {user ? "Your Learning Profile" : "Learning Profile"}
        </h1>
        <p className="text-neutral-400 text-lg">
          {user
            ? "Track your progress, connect with friends, and compete!"
            : "Sign in to track progress, connect with friends, and compete!"}
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
          } ${!user ? "opacity-60" : ""}`}
          disabled={!user}
        >
          <UserIcon className="w-5 h-5" />
          Profile
          {!user && <LockClosedIcon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setActiveTab("friends")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "friends"
              ? "bg-blue-600 text-white"
              : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
          } ${!user ? "opacity-60" : ""}`}
          disabled={!user}
        >
          <UsersIcon className="w-5 h-5" />
          Friends
          {!user && <LockClosedIcon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "leaderboard"
              ? "bg-blue-600 text-white"
              : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
          } ${!user ? "opacity-60" : ""}`}
          disabled={!user}
        >
          <TrophyIcon className="w-5 h-5" />
          Leaderboard
          {!user && <LockClosedIcon className="w-4 h-4" />}
        </button>
      </div>
      {/* Tab Content */}
      {user && (
        <>
          {activeTab === "profile" && <PublicProfile userId={user?.uid} />}

          {activeTab === "friends" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <FriendsList userId={user?.uid} />
              <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                    <span className="text-neutral-400">Active Friends</span>
                    <span className="text-white font-medium">
                      {friends.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                    <span className="text-neutral-400">This Week's Leader</span>
                    <span className="text-white font-medium">
                      {weeklyLeader || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                    <span className="text-neutral-400">Your Rank</span>
                    <span className="text-white font-medium">
                      #{userRank || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Leaderboard userId={user?.uid} />
              </div>
              <div className="space-y-6">
                {/* Personal Stats */}
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Your Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Weekly Rank</span>
                      <span className="text-yellow-400 font-medium">
                        #{userRank || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Points This Week</span>
                      <span className="text-white font-medium">
                        {weeklyPoints?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Weekly Goal</span>
                      <span className="text-green-400 font-medium">
                        {weeklyGoalProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Motivation */}
                <div className="glass-panel p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                  <h4 className="font-bold text-white mb-2">💪 Keep Going!</h4>
                  <p className="text-sm text-purple-300 mb-3">
                    You're only 3 spots away from the top 5! Complete 2 more
                    videos to climb higher.
                  </p>
                  <div className="text-xs text-purple-400">
                    Next rank up in ~150 points
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Main Guest User Message */}
      {!user && (
        <div className="glass-panel p-8 text-center mt-8">
          <div className="text-6xl mb-4">👋</div>
          <h3 className="text-xl font-medium text-white mb-2">
            Sign in to unlock all social features
          </h3>
          <p className="text-neutral-400 mb-6">
            Connect with friends, compete on leaderboards, and showcase your
            learning achievements!
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Sign In to Get Started
          </button>
        </div>
      )}
    </div>
  );
}
