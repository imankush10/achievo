import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { UserProfileService } from '@/services/userProfile';
import { doc, updateDoc } from "firebase/firestore"; // Import directly
import { db } from "@/lib/firebase"; // Import directly
import { useAuth } from './useAuth'; // Assuming you have an auth hook

export const usePublicProfile = (userId?: string) => {
  const { user: authUser } = useAuth(); // Get authenticated user
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // isOwn can be a derived state, no need for useState
  const isOwn = !!authUser && authUser.uid === userId;

  useEffect(() => {
    if (userId) {
      setLoading(true);
      UserProfileService.getUserProfile(userId)
        .then(userProfile => {
          setProfile(userProfile);
        })
        .catch(error => {
          console.error('Failed to load profile:', error);
          setProfile(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !isOwn || !userId) {
        throw new Error("Cannot update profile: not authorized or profile not loaded.");
    }

    try {
      // The update logic is much cleaner now
      const profileRef = doc(db, 'userProfiles', userId);
      await updateDoc(profileRef, updates);

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Failed to update profile:', error);
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
    toggleProfileVisibility
  };
};
