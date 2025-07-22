"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import {
  UserIcon,
  UsersIcon,
  TrophyIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch the logged-in user's profile to get their username for redirection.
  // The hook should not fetch if user.uid is falsy.
  const { profile, loading: profileLoading } = usePublicProfile(user?.uid);

  // State for visual purposes on the guest page.
  const [activeTab, setActiveTab] = useState<"profile" | "friends" | "leaderboard">("profile");

  useEffect(() => {
    // When authentication and profile fetching are complete,
    // and we have a user with a username, redirect.
    if (!authLoading && !profileLoading && user && profile?.username) {
      router.push(`/profile/${profile.username}`);
    }
  }, [user, profile, authLoading, profileLoading, router]);

  // Display a loader while checking authentication or fetching the profile for redirection.
  if (authLoading || (user && profileLoading)) {
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

  // For a logged-in user, render nothing while the redirect is processing
  // to prevent flashing the guest content.
  if (user) {
    return null;
  }

  // If loading is finished and the user is not authenticated, display the guest view.
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Learning Profile
        </h1>
        <p className="text-neutral-400 text-lg">
          Sign in to track progress, connect with friends, and compete!
        </p>
      </div>

      {/* Tab Navigation (Disabled for guests) */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-blue-600 text-white"
              : "bg-neutral-700 text-neutral-300"
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
              : "bg-neutral-700 text-neutral-300"
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
              : "bg-neutral-700 text-neutral-300"
          } ${!user ? "opacity-60" : ""}`}
          disabled={!user}
        >
          <TrophyIcon className="w-5 h-5" />
          Leaderboard
          {!user && <LockClosedIcon className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Main Guest User Message */}
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
    </div>
  );
}
