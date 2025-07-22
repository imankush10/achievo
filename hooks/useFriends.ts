// src/hooks/useFriends.ts

import {
  useState,
  useEffect,
  useCallback
} from 'react';
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  db
} from '@/lib/firebase';
import {
  FriendService
} from '@/services/friendService'; // Import the service
import {
  UserProfile,
  FriendRequest
} from '@/types'; // Make sure FriendRequest is defined in types

// A 'Friend' is a UserProfile
export type Friend = UserProfile;

export const useFriends = (userId?: string) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Listener for ACTUAL FRIENDS (from the user's profile)
  useEffect(() => {
    if (!userId) {
      setFriends([]);
      return;
    }

    const userRef = doc(db, 'userProfiles', userId);
    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      if (!snapshot.exists() || !snapshot.data().friends) {
        setFriends([]);
        return;
      }

      const friendUids: string[] = snapshot.data().friends || [];

      if (friendUids.length === 0) {
        setFriends([]);
        return;
      }

      // Fetch the full profiles for each friend UID
      const profilesQuery = query(collection(db, 'userProfiles'), where('__name__', 'in', friendUids));
      const querySnapshot = await getDocs(profilesQuery);
      const friendProfiles = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        joinedDate: doc.data().joinedDate.toDate(),
        lastActiveDate: doc.data().lastActiveDate.toDate(),
      } as UserProfile));

      setFriends(friendProfiles);
    });

    return () => unsubscribe();
  }, [userId]);

  // Listener for INCOMING and SENT requests (from the friendRequests collection)
  useEffect(() => {
    if (!userId) {
      setIncomingRequests([]);
      setSentRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query for requests sent TO the current user
    const incomingQuery = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', userId),
      where('status', '==', 'pending')
    );

    // Query for requests sent BY the current user
    const sentQuery = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', userId),
      where('status', '==', 'pending')
    );

    const unsubIncoming = onSnapshot(incomingQuery, (snap) => {
      const requests = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      } as FriendRequest));
      setIncomingRequests(requests);
      setLoading(false); // Set loading false after first fetch
    });

    const unsubSent = onSnapshot(sentQuery, (snap) => {
      const requests = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FriendRequest));
      setSentRequests(requests);
    });

    return () => {
      unsubIncoming();
      unsubSent();
    };
  }, [userId]);


  // --- ACTIONS ---
  // These are now simple, clean, and call the secure service layer.

  const acceptRequest = useCallback(async (request: FriendRequest) => {
    try {
      // The hook doesn't need the 'toUid' because the function gets it from the auth context.
      await FriendService.acceptFriendRequest(request.id, request.fromUid);
    } catch (error) {
      console.error("Error accepting request:", error);
      // TODO: Show an error toast to the user
    }
  }, []);

  const declineRequest = useCallback(async (requestId: string) => {
    try {
      await FriendService.declineOrCancelRequest(requestId);
    } catch (error) {
      console.error("Error declining request:", error);
    }
  }, []);

  const cancelSentRequest = useCallback(async (requestId: string) => {
    try {
      await FriendService.declineOrCancelRequest(requestId);
    } catch (error) {
      console.error("Error cancelling request:", error);
    }
  }, []);

  const removeFriend = useCallback(async (friendId: string) => {
    try {
      await FriendService.removeFriend(friendId);
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  }, []);


  return {
    friends,
    incomingRequests,
    sentRequests,
    loading,
    acceptRequest,
    declineRequest,
    cancelSentRequest,
    removeFriend,
  };
};
