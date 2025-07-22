// src/components/FindFriendsModal.tsx
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types';
import { UserProfileService } from '@/services/userProfile';
import { FriendService } from '@/services/friendService';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';

interface FindFriendsModalProps {
  onClose: () => void;
}

export const FindFriendsModal: React.FC<FindFriendsModalProps> = ({ onClose }) => {
  const { user: currentUser } = useAuth();
  const { friends, incomingRequests, sentRequests } = useFriends(currentUser?.uid);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.trim().length < 3) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      const users = await UserProfileService.searchUsers(debouncedQuery);
      setResults(users.filter(u => u.uid !== currentUser?.uid));
      setLoading(false);
    };

    search();
  }, [debouncedQuery, currentUser?.uid]);

  const handleSendRequest = async (targetUser: UserProfile) => {
    if (!currentUser) return;
    try {
      await FriendService.sendFriendRequest({
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'A User',
        photoURL: currentUser.photoURL || ''
      }, targetUser.uid);
    } catch (error) {
        console.error("Failed to send friend request:", error);
    }
  };
  
  const getRelationshipStatus = (targetUserId: string) => {
    if (friends.some(f => f.uid === targetUserId)) return "Friends";
    if (incomingRequests.some(r => r.fromUid === targetUserId)) return "Request Received";
    if (sentRequests.some(r => r.toUid === targetUserId)) return "Request Sent";
    return "None";
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass-panel p-6 rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">Find Friends</h3>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loading && <p className="text-neutral-400 text-center">Searching...</p>}
          {!loading && results.map(user => {
            const status = getRelationshipStatus(user.uid);
            return (
              <div key={user.uid} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded">
                <div className="flex items-center gap-3">
                  <img src={user.photoURL || '/default-avatar.png'} className="w-8 h-8 rounded-full bg-neutral-700" alt={user.displayName} />
                  <div>
                    <p className="text-white font-medium">{user.displayName}</p>
                    <p className="text-neutral-500 text-sm">@{user.username}</p>
                  </div>
                </div>
                {status === 'None' && (
                    <button onClick={() => handleSendRequest(user)} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                      <UserPlusIcon className="w-5 h-5" />
                    </button>
                )}
                {status === 'Request Sent' && (
                    <div className="p-2 text-neutral-400 flex items-center gap-1 text-sm"><CheckIcon className="w-4 h-4"/> Sent</div>
                )}
                {status === 'Friends' && (
                    <p className="text-green-400 text-sm font-medium">Friends</p>
                )}
                {status === 'Request Received' && (
                    <p className="text-yellow-400 text-sm font-medium">Check Requests</p>
                )}
              </div>
            )
          })}
          {!loading && debouncedQuery.length >= 3 && results.length === 0 && (
             <p className="text-neutral-400 text-center py-4">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
