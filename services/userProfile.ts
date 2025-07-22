import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Playlist } from "@/types";

export class UserProfileService {
  // Create or update user profile
  static async createOrUpdateProfile(
    uid: string,
    userData: {
      email: string;
      displayName: string;
      photoURL?: string;
      username?: string;
    }
  ): Promise<void> {
    const profileRef = doc(db, "userProfiles", uid);
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

  // Generate unique username
  static generateUsername(displayName: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const random = Math.floor(Math.random() * 1000);
    return `${base}${random}`;
  }

  // Check if username is available
  static async isUsernameAvailable(
    username: string,
    currentUserId?: string
  ): Promise<boolean> {
    const q = query(
      collection(db, "userProfiles"),
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

  // Get user profile by UID
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    const profileRef = doc(db, "userProfiles", uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        ...data,
        joinedDate: data.joinedDate.toDate(),
        lastActiveDate: data.lastActiveDate.toDate(),
      } as UserProfile;
    }

    return null;
  }
  static async getUserProfileByUsername(
    username: string
  ): Promise<UserProfile | null> {
    const q = query(
      collection(db, "userProfiles"),
      where("username", "==", username),
      firestoreLimit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const profileSnap = querySnapshot.docs[0];
    const data = profileSnap.data();

    return {
      ...data,
      // Make sure to include the document ID as the uid
      uid: profileSnap.id,
      joinedDate: data.joinedDate.toDate(),
      lastActiveDate: data.lastActiveDate.toDate(),
    } as UserProfile;
  }
  // Search users by username or display name
  static async searchUsers(
    searchTerm: string,
    limitCount: number = 10
  ): Promise<UserProfile[]> {
    const searchLower = searchTerm.toLowerCase();

    // Search by username
    const usernameQuery = query(
      collection(db, "userProfiles"),
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
        uid: doc.id, // Make sure to include the document ID as the uid
        joinedDate: data.joinedDate.toDate(),
        lastActiveDate: data.lastActiveDate.toDate(),
      } as UserProfile);
    });

    return users;
  }

  // Update user stats (called when playlists change)
  static async updateUserStats(
    uid: string,
    playlists: Playlist[]
  ): Promise<void> {
    const stats = this.calculateStatsFromPlaylists(playlists);

    await updateDoc(doc(db, "userProfiles", uid), {
      "stats.totalPlaylists": stats.totalPlaylists,
      "stats.completedPlaylists": stats.completedPlaylists,
      "stats.totalVideos": stats.totalVideos,
      "stats.completedVideos": stats.completedVideos,
      "stats.totalLearningTime": stats.totalLearningTime,
      "stats.completedLearningTime": stats.completedLearningTime,
      "stats.categoriesExplored": stats.categoriesExplored,
      lastActiveDate: Timestamp.now(),
    });
  }

  private static calculateStatsFromPlaylists(playlists: Playlist[]) {
    const totalPlaylists = playlists.length;
    const completedPlaylists = playlists.filter(
      (p) => p.videos.length > 0 && p.videos.every((v) => v.completed)
    ).length;

    const totalVideos = playlists.reduce((sum, p) => sum + p.videos.length, 0);
    const completedVideos = playlists.reduce(
      (sum, p) => sum + p.videos.filter((v) => v.completed).length,
      0
    );

    const totalLearningTime = playlists.reduce(
      (sum, p) => sum + p.totalDuration,
      0
    );
    const completedLearningTime = playlists.reduce(
      (sum, p) =>
        sum +
        p.videos
          .filter((v) => v.completed)
          .reduce((vSum, v) => vSum + v.durationInSeconds, 0),
      0
    );

    const categoriesExplored = [
      ...new Set(playlists.flatMap((p) => p.categories || [])),
    ];

    return {
      totalPlaylists,
      completedPlaylists,
      totalVideos,
      completedVideos,
      totalLearningTime,
      completedLearningTime,
      categoriesExplored,
    };
  }

  // Get leaderboard data
  static async getLeaderboard(
    timeframe: "weekly" | "monthly" | "all-time",
    limitCount: number = 50
  ): Promise<UserProfile[]> {
    let q;

    if (timeframe === "all-time") {
      q = query(
        collection(db, "userProfiles"),
        where("isPublic", "==", true),
        orderBy("stats.completedLearningTime", "desc"),
        firestoreLimit(limitCount)
      );
    } else if (timeframe === "weekly") {
      q = query(
        collection(db, "userProfiles"),
        where("isPublic", "==", true),
        orderBy("stats.weeklyLearningTime", "desc"),
        firestoreLimit(limitCount)
      );
    } else {
      q = query(
        collection(db, "userProfiles"),
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
    const profileRef = doc(db, "userProfiles", userId);

    await updateDoc(profileRef, {
      unlockedAchievements: arrayUnion(...achievementIds),
    });
  }
}
