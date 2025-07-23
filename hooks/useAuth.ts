import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useContext } from "react";
import { auth } from "@/lib/firebase";
import { AuthContext } from "@/context/AuthContext";

// This hook now uses the global AuthContext for state
// and only provides auth action functions
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, userProfile, loading } = context;

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
    error: null, // AuthContext doesn't expose error, but we can add it if needed
    signInWithGoogle,
    logout,
    getProfileUrl,
    isProfileComplete,
    isAuthenticated: !!user,
  };
};
