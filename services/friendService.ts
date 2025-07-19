import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FriendRequest, UserProfile } from '@/types';

export class FriendService {
  // Send friend request
  static async sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    if (fromUserId === toUserId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if users are already friends
    const fromProfile = await getDoc(doc(db, 'userProfiles', fromUserId));
    if (fromProfile.exists() && fromProfile.data().friends?.includes(toUserId)) {
      throw new Error("You are already friends with this user");
    }

    // Check if request already exists
    const existingRequest = await this.getFriendRequest(fromUserId, toUserId);
    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    // Get user profiles for the request
    const [fromUserSnap, toUserSnap] = await Promise.all([
      getDoc(doc(db, 'userProfiles', fromUserId)),
      getDoc(doc(db, 'userProfiles', toUserId))
    ]);

    if (!fromUserSnap.exists() || !toUserSnap.exists()) {
      throw new Error("User not found");
    }

    const fromUser = fromUserSnap.data();
    const requestId = `${fromUserId}_${toUserId}`;

    // Create friend request document
    const friendRequest: FriendRequest = {
      id: requestId,
      fromUserId,
      fromUsername: fromUser.username,
      fromDisplayName: fromUser.displayName,
      fromPhotoURL: fromUser.photoURL,
      toUserId,
      status: 'pending',
      createdAt: new Date()
    };

    await setDoc(doc(db, 'friendRequests', requestId), {
      ...friendRequest,
      createdAt: Timestamp.now()
    });

    // Update user profiles
    await Promise.all([
      updateDoc(doc(db, 'userProfiles', fromUserId), {
        'friendRequests.outgoing': arrayUnion(toUserId)
      }),
      updateDoc(doc(db, 'userProfiles', toUserId), {
        'friendRequests.incoming': arrayUnion(fromUserId)
      })
    ]);
  }

  // Accept friend request
  static async acceptFriendRequest(requestId: string): Promise<void> {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Friend request not found");
    }

    const request = requestSnap.data() as FriendRequest;

    // Add to friends lists
    await Promise.all([
      updateDoc(doc(db, 'userProfiles', request.fromUserId), {
        friends: arrayUnion(request.toUserId),
        'friendRequests.outgoing': arrayRemove(request.toUserId)
      }),
      updateDoc(doc(db, 'userProfiles', request.toUserId), {
        friends: arrayUnion(request.fromUserId),
        'friendRequests.incoming': arrayRemove(request.fromUserId)
      })
    ]);

    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted'
    });
  }

  // Decline friend request
  static async declineFriendRequest(requestId: string): Promise<void> {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Friend request not found");
    }

    const request = requestSnap.data() as FriendRequest;

    // Remove from pending lists
    await Promise.all([
      updateDoc(doc(db, 'userProfiles', request.fromUserId), {
        'friendRequests.outgoing': arrayRemove(request.toUserId)
      }),
      updateDoc(doc(db, 'userProfiles', request.toUserId), {
        'friendRequests.incoming': arrayRemove(request.fromUserId)
      })
    ]);

    // Delete request
    await deleteDoc(requestRef);
  }

  // Remove friend
  static async removeFriend(userId: string, friendId: string): Promise<void> {
    await Promise.all([
      updateDoc(doc(db, 'userProfiles', userId), {
        friends: arrayRemove(friendId)
      }),
      updateDoc(doc(db, 'userProfiles', friendId), {
        friends: arrayRemove(userId)
      })
    ]);
  }

  // Get friend request between two users
  static async getFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest | null> {
    const requestId = `${fromUserId}_${toUserId}`;
    const requestSnap = await getDoc(doc(db, 'friendRequests', requestId));

    if (requestSnap.exists()) {
      const data = requestSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate()
      } as FriendRequest;
    }

    return null;
  }

  // Get incoming friend requests for a user
  static async getIncomingFriendRequests(userId: string): Promise<FriendRequest[]> {
    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const requests: FriendRequest[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      requests.push({
        ...data,
        createdAt: data.createdAt.toDate()
      } as FriendRequest);
    });

    return requests;
  }

  // Get friends list with their profiles
  static async getFriendsWithProfiles(userId: string): Promise<UserProfile[]> {
    const userProfile = await getDoc(doc(db, 'userProfiles', userId));
    
    if (!userProfile.exists()) return [];

    const friendIds = userProfile.data().friends || [];
    if (friendIds.length === 0) return [];

    const friendProfiles = await Promise.all(
      friendIds.map(async (friendId: string) => {
        const friendSnap = await getDoc(doc(db, 'userProfiles', friendId));
        if (friendSnap.exists()) {
          const data = friendSnap.data();
          return {
            ...data,
            joinedDate: data.joinedDate.toDate(),
            lastActiveDate: data.lastActiveDate.toDate()
          } as UserProfile;
        }
        return null;
      })
    );

    return friendProfiles.filter(profile => profile !== null) as UserProfile[];
  }
}
