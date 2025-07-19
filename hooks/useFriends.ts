import { useState, useEffect } from 'react';
import { UserProfile, FriendRequest } from '@/types';
import { FriendService } from '@/services/friendService';

export const useFriends = (userId?: string) => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadFriendsData();
    }
  }, [userId]);

  const loadFriendsData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        FriendService.getFriendsWithProfiles(userId),
        FriendService.getIncomingFriendRequests(userId)
      ]);
      
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!userId) return;
    
    try {
      await FriendService.sendFriendRequest(userId, targetUserId);
      await loadFriendsData(); // Refresh data
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await FriendService.acceptFriendRequest(requestId);
      await loadFriendsData(); // Refresh data
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await FriendService.declineFriendRequest(requestId);
      await loadFriendsData(); // Refresh data
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      throw error;
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!userId) return;
    
    try {
      await FriendService.removeFriend(userId, friendId);
      await loadFriendsData(); // Refresh data
    } catch (error) {
      console.error('Failed to remove friend:', error);
      throw error;
    }
  };

  return {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshData: loadFriendsData
  };
};
