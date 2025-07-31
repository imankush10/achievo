export interface Video {
  id: string;
  title: string;
  duration: string;
  durationInSeconds: number;
  thumbnailUrl: string;
  completed: boolean;
  order: number;
  videoUrl?: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string;
  videos: Video[];
  thumbnailUrl: string;
  totalDuration: number;
  totalVideos: number;
  completedDuration: number;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  categories: string[];
  tags: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface UserProfile {
  uid: string;
  username: string; // NEW: Unique username for friend requests
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  isPublic: boolean;
  joinedDate: Date;
  lastActiveDate: Date;

  // Real stats calculated from user's playlists
  stats: {
    totalPlaylists: number;
    completedPlaylists: number;
    totalVideos: number;
    completedVideos: number;
    totalLearningTime: number; // in seconds
    completedLearningTime: number;
    currentStreak: number;
    longestStreak: number;
    categoriesExplored: string[];
    weeklyLearningTime: number;
    monthlyCompletions: number;
  };

  // Achievement IDs that user has unlocked
  unlockedAchievements: string[];

  // Social links
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };

  friends: string[];
  friendRequests: {
    incoming: string[]; // UIDs of users who sent requests
    outgoing: string[]; // UIDs of users we sent requests to
  };
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromPhotoURL?: string;
  toUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}
export interface Goal {
  id: string; // Document ID from Firestore
  type: 'weekly_hours' | 'monthly_playlists' | 'daily_streak';
  title: string;
  description: string;
  target: number;
  unit: string;
  createdAt: Date;
  // Progress will be calculated on the fly, not stored
}