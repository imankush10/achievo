"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { DatabaseService } from "@/services/databaseService";
import { UserProfile, Playlist } from "@/types";
import { User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: FirebaseUser | null | undefined;
  userProfile: UserProfile | null;
  loading: boolean;
  migrationCompleted: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, authLoading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  // This single effect handles all logic when the user's auth state changes.
  useEffect(() => {
    // If Firebase Auth is still loading, do nothing.
    if (authLoading) {
      return;
    }

    let unsubscribe = () => {};

    if (user) {
      // User has logged in. Start the initialization sequence.
      const initializeUserSession = async () => {
        setProfileLoading(true);

        // --- Step 1: Ensure user profile exists ---
        // This must complete before anything else.
        await DatabaseService.createOrUpdateProfile(user.uid, {
          email: user.email!,
          displayName: user.displayName || "Anonymous User",
          photoURL: user.photoURL || undefined,
        });

        // --- Step 2: Migrate local data ---
        // This runs only once per session if local data exists.
        const localPlaylists: Playlist[] = JSON.parse(localStorage.getItem("localPlaylists") || "[]");
        if (localPlaylists.length > 0) {
          console.log(`Migrating ${localPlaylists.length} local playlists...`);
          try {
            await Promise.all(
              localPlaylists.map(playlist => {
                // Ensure we don't pass guest-specific fields
                const { id, userId, ...firebaseData } = playlist;
                return DatabaseService.createPlaylist(user.uid, firebaseData);
              })
            );
            localStorage.removeItem("localPlaylists"); // Clear data after success
            console.log("Migration successful.");
          } catch (error) {
            console.error("Migration failed:", error);
            // Decide how to handle failure. Maybe notify the user.
          }
        }
        
        // --- Step 3: Set up real-time listener for the user's profile ---
        unsubscribe = onSnapshot(doc(db, "userProfiles", user.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserProfile({
              ...data,
              uid: snapshot.id,
              joinedDate: data.joinedDate.toDate(),
              lastActiveDate: data.lastActiveDate.toDate(),
            } as UserProfile);
          }
        });
        
        // --- Step 4: Signal that all initialization is complete ---
        setMigrationCompleted(true);
        setProfileLoading(false);
      };

      initializeUserSession();

    } else {
      // User is logged out. Reset everything.
      setUserProfile(null);
      setProfileLoading(false);
      setMigrationCompleted(false);
    }

    // Cleanup function for the real-time listener
    return () => unsubscribe();

  }, [user, authLoading]);

  const value = {
    user,
    userProfile,
    loading: authLoading || profileLoading,
    migrationCompleted,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This is now the ONE hook to get auth state.
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
