import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp, 
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Playlist, Video } from '@/types';

export class DatabaseService {
  static async createPlaylist(userId: string, playlistData: Omit<Playlist, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'playlists'), {
        ...playlistData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw new Error('Failed to create playlist');
    }
  }

  static async updatePlaylist(playlistId: string, updates: Partial<Playlist>): Promise<void> {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw new Error('Failed to update playlist');
    }
  }

  static async deletePlaylist(playlistId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'playlists', playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw new Error('Failed to delete playlist');
    }
  }

  static async getUserPlaylists(userId: string): Promise<Playlist[]> {
    try {
      const q = query(
        collection(db, 'playlists'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Playlist[];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw new Error('Failed to fetch playlists');
    }
  }

  static subscribeToUserPlaylists(userId: string, callback: (playlists: Playlist[]) => void): () => void {
    const q = query(
      collection(db, 'playlists'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const playlists = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Playlist[];
      callback(playlists);
    });
  }

  static async toggleVideoCompletion(playlistId: string, videoId: string, completed: boolean): Promise<void> {
    try {
      // First get the current playlist
      const playlistRef = doc(db, 'playlists', playlistId);
      const playlistDoc = await getDoc(playlistRef);
      
      if (!playlistDoc.exists()) {
        throw new Error('Playlist not found');
      }
      
      const playlistData = playlistDoc.data() as Playlist;
      const updatedVideos = playlistData.videos.map(video =>
        video.id === videoId ? { ...video, completed } : video
      );
      
      await updateDoc(playlistRef, {
        videos: updatedVideos,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error toggling video completion:', error);
      throw new Error('Failed to update video status');
    }
  }
  
}
