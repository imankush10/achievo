import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { DatabaseService } from "@/services/databaseService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export const usePublicProfile = (userId?: string) => {
  const {
    user: authUser,
    userProfile: authUserProfile,
    loading: authLoading,
  } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if this is the authenticated user's own profile
  const isOwn = !!authUser && authUser.uid === userId;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // If viewing own profile, use the profile from AuthContext
    if (isOwn && authUserProfile) {
      setProfile(authUserProfile);
      setLoading(authLoading);
      return;
    }

    // If viewing someone else's profile, fetch it
    if (!isOwn) {
      setLoading(true);
      DatabaseService.getProfile(userId)
        .then((userProfile: UserProfile | null) => {
          setProfile(userProfile);
        })
        .catch((error: Error) => {
          console.error("Failed to load profile:", error);
          setProfile(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, authUser, authUserProfile, authLoading, isOwn]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !isOwn || !userId) {
      throw new Error(
        "Cannot update profile: not authorized or profile not loaded."
      );
    }

    try {
      // The update logic is much cleaner now
      const profileRef = doc(db, "userProfiles", userId);
      await updateDoc(profileRef, updates);

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const toggleProfileVisibility = async () => {
    if (profile && isOwn) {
      await updateProfile({ isPublic: !profile.isPublic });
    }
  };

  return {
    profile,
    loading,
    isOwn,
    updateProfile,
    toggleProfileVisibility,
  };
};
