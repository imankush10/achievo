export interface Video {
  id: string;
  title: string;
  duration: string;
  durationInSeconds: number;
  thumbnailUrl: string;
  completed: boolean;
  order: number;
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
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
