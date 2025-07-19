import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { UserProfileService } from '@/services/userProfile';

export const usePublicProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwn, setIsOwn] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId]);

  const loadProfile = async (targetUserId: string) => {
    setLoading(true);
    
    try {
      const userProfile = await UserProfileService.getUserProfile(targetUserId);
      setProfile(userProfile);
      setIsOwn(targetUserId === userId); // You can get current user from auth context
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (profile && isOwn && userId) {
      try {
        // Update specific fields in Firebase
        const updateData: any = {};
        
        if (updates.displayName) updateData.displayName = updates.displayName;
        if (updates.bio !== undefined) updateData.bio = updates.bio;
        if (updates.socialLinks) updateData.socialLinks = updates.socialLinks;
        if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

        await import('firebase/firestore').then(({ updateDoc, doc }) => {
          return updateDoc(doc(import('@/lib/firebase').then(m => m.db), 'userProfiles', userId), updateData);
        });

        // Update local state
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
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
