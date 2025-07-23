import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  arrayUnion,
  serverTimestamp,
  limit as firestoreLimit,
} from "firebase/firestore";
import { Playlist, Goal, UserProfile } from "@/types";
import {
  calculateStatsFromPlaylists,
  UserStats,
} from "@/utils/statsCalculator";
import { getStreakData } from "@/utils/streakCalculator";

// Prepare callable Cloud Function references
const acceptFriendRequestFn = httpsCallable(functions, "acceptFriendRequest");
const removeFriendFn = httpsCallable(functions, "removeFriend");

export class DatabaseService {
  // --- User Profile Methods ---
  static profilesCollection = collection(db, "userProfiles");

  static async getProfile(uid: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(this.profilesCollection, uid));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      ...data,
      uid: docSnap.id,
      joinedDate: data.joinedDate.toDate(),
      lastActiveDate: data.lastActiveDate.toDate(),
    } as UserProfile;
  }

  /**
   * Fetches a user profile by their username.
   * Handles security rules for both authenticated and unauthenticated users.
   * @param username The username to search for.
   * @param isAuth Whether the current session user is authenticated.
   * @returns The user profile or null if not found or not public.
   */
  static async getProfileByUsername(
    username: string,
    isAuth: boolean
  ): Promise<UserProfile | null> {
    // Base query to find the user by their unique username
    const profilesRef = collection(db, "userProfiles");
    let profileQuery;

    if (isAuth) {
      // Authenticated user: They can query for any user by username.
      // The Firestore 'read' rule will handle if they are allowed to see the result.
      profileQuery = query(
        profilesRef,
        where("username", "==", username),
        firestoreLimit(1)
      );
    } else {
      // Unauthenticated user: The query MUST include the isPublic flag
      // to satisfy the security rules.
      profileQuery = query(
        profilesRef,
        where("username", "==", username),
        where("isPublic", "==", true), // <-- THE CRUCIAL PART FOR GUESTS
        firestoreLimit(1)
      );
    }

    try {
      const querySnapshot = await getDocs(profileQuery);

      if (querySnapshot.empty) {
        console.log(
          `Profile not found or not public for username: ${username}`
        );
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // Ensure date fields are correctly converted
      return {
        ...data,
        uid: doc.id,
        joinedDate: data.joinedDate?.toDate(),
        lastActiveDate: data.lastActiveDate?.toDate(),
      } as UserProfile;
    } catch (error) {
      console.error("Error in getProfileByUsername:", error);
      // This will catch 'insufficient permissions' if the rules/query are mismatched
      return null;
    }
  }

  static async createOrUpdateProfile(
    uid: string,
    userData: {
      email: string;
      displayName: string;
      photoURL?: string;
      username?: string;
    }
  ): Promise<void> {
    const profileRef = doc(this.profilesCollection, uid);
    const existingProfile = await getDoc(profileRef);

    if (!existingProfile.exists()) {
      // Create new profile
      const newProfile: UserProfile = {
        uid,
        username:
          userData.username || this.generateUsername(userData.displayName),
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        bio: "",
        isPublic: true,
        joinedDate: new Date(),
        lastActiveDate: new Date(),
        stats: {
          totalPlaylists: 0,
          completedPlaylists: 0,
          totalVideos: 0,
          completedVideos: 0,
          totalLearningTime: 0,
          completedLearningTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          categoriesExplored: [],
          weeklyLearningTime: 0,
          monthlyCompletions: 0,
        },
        unlockedAchievements: [],
        friends: [],
        friendRequests: {
          incoming: [],
          outgoing: [],
        },
      };

      await setDoc(profileRef, {
        ...newProfile,
        joinedDate: Timestamp.now(),
        lastActiveDate: Timestamp.now(),
      });
    } else {
      // Update existing profile
      await updateDoc(profileRef, {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        lastActiveDate: Timestamp.now(),
      });
    }
  }

  static generateUsername(displayName: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const random = Math.floor(Math.random() * 1000);
    return `${base}${random}`;
  }

  static async isUsernameAvailable(
    username: string,
    currentUserId?: string
  ): Promise<boolean> {
    const q = query(
      this.profilesCollection,
      where("username", "==", username.toLowerCase())
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return true;

    // If user is updating their own username, allow it
    if (currentUserId && querySnapshot.docs[0].id === currentUserId) {
      return true;
    }

    return false;
  }

  static async searchUsers(
    searchTerm: string,
    limitCount: number = 10
  ): Promise<UserProfile[]> {
    const searchLower = searchTerm.toLowerCase();

    const usernameQuery = query(
      this.profilesCollection,
      where("username", ">=", searchLower),
      where("username", "<=", searchLower + "\uf8ff"),
      where("isPublic", "==", true),
      orderBy("username"),
      firestoreLimit(limitCount)
    );

    const usernameResults = await getDocs(usernameQuery);
    const users: UserProfile[] = [];

    usernameResults.forEach((doc) => {
      const data = doc.data();
      users.push({
        ...data,
        uid: doc.id,
        joinedDate: data.joinedDate.toDate(),
        lastActiveDate: data.lastActiveDate.toDate(),
      } as UserProfile);
    });

    return users;
  }

  static async updateUserStats(
    uid: string,
    playlists: Playlist[]
  ): Promise<void>;
  static async updateUserStats(uid: string, stats: UserStats): Promise<void>;
  static async updateUserStats(
    uid: string,
    playlistsOrStats: Playlist[] | UserStats
  ): Promise<void> {
    const stats = Array.isArray(playlistsOrStats)
      ? calculateStatsFromPlaylists(playlistsOrStats)
      : playlistsOrStats;

    // Get current streak data from streakCalculator
    const streakData = getStreakData(uid);

    // Calculate weekly and monthly stats
    // Note: These are placeholder calculations since we don't have historical completion data
    // In a real app, you'd track completion dates to calculate these properly

    // More reasonable estimates: assume recent activity rather than % of total
    const weeklyLearningTime = Math.min(
      Math.round(stats.completedLearningTime * 0.02), // Max 2% of total time as "weekly"
      7200 // Cap at 2 hours per week to prevent inflated numbers
    );
    const monthlyCompletions = Math.min(
      Math.round(stats.completedVideos * 0.05), // Max 5% of total videos as "monthly"
      50 // Cap at 50 videos per month
    );

    await updateDoc(doc(this.profilesCollection, uid), {
      "stats.totalPlaylists": stats.totalPlaylists,
      "stats.completedPlaylists": stats.completedPlaylists,
      "stats.totalVideos": stats.totalVideos,
      "stats.completedVideos": stats.completedVideos,
      "stats.totalLearningTime": stats.totalLearningTime,
      "stats.completedLearningTime": stats.completedLearningTime,
      "stats.currentStreak": streakData.currentStreak,
      "stats.longestStreak": streakData.longestStreak,
      "stats.categoriesExplored": stats.categoriesExplored,
      "stats.weeklyLearningTime": weeklyLearningTime,
      "stats.monthlyCompletions": monthlyCompletions,
      lastActiveDate: Timestamp.now(),
    });
  }

  static async getLeaderboard(
    timeframe: "weekly" | "monthly" | "all-time",
    limitCount: number = 50
  ): Promise<UserProfile[]> {
    let q;

    if (timeframe === "all-time") {
      q = query(
        this.profilesCollection,
        where("isPublic", "==", true),
        orderBy("stats.completedLearningTime", "desc"),
        firestoreLimit(limitCount)
      );
    } else if (timeframe === "weekly") {
      q = query(
        this.profilesCollection,
        where("isPublic", "==", true),
        orderBy("stats.weeklyLearningTime", "desc"),
        firestoreLimit(limitCount)
      );
    } else {
      q = query(
        this.profilesCollection,
        where("isPublic", "==", true),
        orderBy("stats.monthlyCompletions", "desc"),
        firestoreLimit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        ...data,
        uid: doc.id,
        joinedDate: data.joinedDate.toDate(),
        lastActiveDate: data.lastActiveDate.toDate(),
      } as UserProfile);
    });

    return users;
  }

  static async unlockAchievements(
    userId: string,
    achievementIds: string[]
  ): Promise<void> {
    if (achievementIds.length === 0) return;
    const profileRef = doc(this.profilesCollection, userId);

    await updateDoc(profileRef, {
      unlockedAchievements: arrayUnion(...achievementIds),
    });
  }

  // --- Playlist Methods ---
  static playlistsCollection = collection(db, "playlists");

  static async createPlaylist(
    userId: string,
    playlistData: Omit<Playlist, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(this.playlistsCollection, {
        ...playlistData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating playlist:", error);
      throw new Error("Failed to create playlist");
    }
  }

  static async updatePlaylist(
    playlistId: string,
    updates: Partial<Playlist>
  ): Promise<void> {
    try {
      const playlistRef = doc(this.playlistsCollection, playlistId);
      await updateDoc(playlistRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating playlist:", error);
      throw new Error("Failed to update playlist");
    }
  }

  static async deletePlaylist(playlistId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.playlistsCollection, playlistId));
    } catch (error) {
      console.error("Error deleting playlist:", error);
      throw new Error("Failed to delete playlist");
    }
  }

  static async getUserPlaylists(userId: string): Promise<Playlist[]> {
    try {
      const q = query(
        this.playlistsCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Playlist[];
    } catch (error) {
      console.error("Error fetching playlists:", error);
      throw new Error("Failed to fetch playlists");
    }
  }

  static subscribeToUserPlaylists(
    userId: string,
    callback: (playlists: Playlist[]) => void
  ): () => void {
    const q = query(
      this.playlistsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
      const playlists = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Playlist[];
      callback(playlists);
    });
  }

  static async toggleVideoCompletion(
    playlistId: string,
    videoId: string,
    completed: boolean
  ): Promise<void> {
    try {
      const playlistRef = doc(this.playlistsCollection, playlistId);
      const playlistDoc = await getDoc(playlistRef);

      if (!playlistDoc.exists()) {
        throw new Error("Playlist not found");
      }

      const playlistData = playlistDoc.data() as Playlist;
      const updatedVideos = playlistData.videos.map((video) =>
        video.id === videoId ? { ...video, completed } : video
      );

      await updateDoc(playlistRef, {
        videos: updatedVideos,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error toggling video completion:", error);
      throw new Error("Failed to update video status");
    }
  }

  // --- Goal Methods ---
  static goalsCollection(userId: string) {
    return collection(db, "userProfiles", userId, "goals");
  }

  static async getGoals(userId: string): Promise<Goal[]> {
    const q = query(this.goalsCollection(userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
      } as Goal;
    });
  }

  static async createGoal(
    userId: string,
    goalData: Omit<Goal, "id">
  ): Promise<string> {
    const docRef = await addDoc(this.goalsCollection(userId), {
      ...goalData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<Goal>
  ): Promise<void> {
    const goalRef = doc(this.goalsCollection(userId), goalId);
    await updateDoc(goalRef, updates);
  }

  static async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goalRef = doc(this.goalsCollection(userId), goalId);
    await deleteDoc(goalRef);
  }

  // --- Friend Methods ---
  static friendsCollection = collection(db, "friendRequests");

  static async sendFriendRequest(
    fromUser: { uid: string; displayName: string; photoURL?: string },
    toUid: string
  ): Promise<void> {
    if (fromUser.uid === toUid) {
      throw new Error("You cannot send a friend request to yourself.");
    }
    await addDoc(this.friendsCollection, {
      fromUid: fromUser.uid,
      fromName: fromUser.displayName,
      fromAvatar: fromUser.photoURL || "",
      toUid: toUid,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  }

  static async acceptFriendRequest(
    requestId: string,
    fromUid: string
  ): Promise<void> {
    await acceptFriendRequestFn({ requestId, fromUid });
  }

  static async declineOrCancelRequest(requestId: string): Promise<void> {
    await deleteDoc(doc(this.friendsCollection, requestId));
  }

  static async removeFriend(friendId: string): Promise<void> {
    await removeFriendFn({ friendId });
  }
}
