import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { UserProfileService } from "@/services/userProfile";
import { UserProfile } from "@/types";

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Create or update user profile
  useEffect(() => {
    if (user && !loading) {
      (async () => {
        try {
          await UserProfileService.createOrUpdateProfile(user.uid, {
            email: user.email!,
            displayName: user.displayName || "Anonymous User",
            photoURL: user.photoURL || undefined,
          });

          const profile = await UserProfileService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Failed to fetch or update user profile:", err);
        }
      })();
    } else {
      setUserProfile(null);
    }
  }, [user, loading]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper method to get profile URL
  const getProfileUrl = () => {
    if (user && userProfile?.username) {
      return `/profile/${userProfile.username}`;
    }
    return "/profile"; // Login prompt page
  };

  // Check if user has completed profile setup
  const isProfileComplete = () => {
    return !!(user && userProfile?.username);
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    logout,
    getProfileUrl,
    isProfileComplete,
    isAuthenticated: !!user,
  };
};