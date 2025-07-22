// src/services/friendService.ts

import { db, functions } from '@/lib/firebase'; // Ensure 'functions' is exported from your firebase config
import { httpsCallable } from 'firebase/functions';
import {
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';

// Prepare callable function references
const acceptFriendRequestFn = httpsCallable(functions, 'acceptFriendRequest');
const removeFriendFn = httpsCallable(functions, 'removeFriend');

export class FriendService {

  /**
   * Creates a new document in the 'friendRequests' collection.
   * This is secure and runs on the client.
   */
  static async sendFriendRequest(
    fromUser: { uid: string; displayName: string; photoURL?: string },
    toUid: string
  ): Promise<void> {
    if (fromUser.uid === toUid) {
      throw new Error("You cannot send a friend request to yourself.");
    }
    await addDoc(collection(db, 'friendRequests'), {
      fromUid: fromUser.uid,
      fromName: fromUser.displayName,
      fromAvatar: fromUser.photoURL || '',
      toUid: toUid,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Triggers the 'acceptFriendRequest' Cloud Function.
   */
  static async acceptFriendRequest(requestId: string, fromUid: string): Promise<void> {
    await acceptFriendRequestFn({ requestId, fromUid });
  }

  /**
   * Deletes a request document. Used for declining or cancelling.
   * This is secure and runs on the client.
   */
  static async declineOrCancelRequest(requestId: string): Promise<void> {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  }

  /**
   * Triggers the 'removeFriend' Cloud Function.
   */
  static async removeFriend(friendId: string): Promise<void> {
    await removeFriendFn({ friendId });
  }
}
