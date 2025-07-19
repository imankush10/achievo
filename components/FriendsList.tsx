import React, { useState } from "react";
import {
  UserPlusIcon,
  UserMinusIcon,
  CheckIcon,
  XMarkIcon,
  FireIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useFriends, Friend } from "@/hooks/useFriends";

interface FriendsListProps {
  userId?: string;
}

export const FriendsList: React.FC<FriendsListProps> = ({ userId }) => {
  const {
    friends,
    friendRequests,
    loading,
    acceptFriendRequest,
    removeFriend,
  } = useFriends(userId);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  const filteredFriends = friends.filter((friend) =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FriendCard: React.FC<{ friend: Friend; showActions?: boolean }> = ({
    friend,
    showActions = true,
  }) => {
    const isOnline =
      friend.lastActive && Date.now() - friend.lastActive.getTime() < 300000; // Online if active in last 5 minutes

    return (
      <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:border-neutral-600/50 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="text-3xl">{friend.avatar || "👤"}</div>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-neutral-800 rounded-full"></div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-white">{friend.displayName}</h4>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                <span className="flex items-center gap-1">
                  <FireIcon className="w-3 h-3" />
                  {friend.currentStreak} streak
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {friend.weeklyLearningTime.toFixed(1)}h this week
                </span>
              </div>
              {friend.lastActive && (
                <p className="text-xs text-neutral-500 mt-1">
                  {isOnline
                    ? "Online now"
                    : `Last seen ${friend.lastActive.toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {friend.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(friend.userId)}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    title="Accept friend request"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFriend(friend.userId)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Decline friend request"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => removeFriend(friend.userId)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  title="Remove friend"
                >
                  <UserMinusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-700 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <UserPlusIcon className="w-6 h-6 text-blue-500" />
          Friends
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "friends"
                ? "bg-blue-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
              activeTab === "requests"
                ? "bg-blue-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            Requests ({friendRequests.length})
            {friendRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {activeTab === "friends" && friends.length > 0 && (
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      )}

      {/* Friends List */}
      {activeTab === "friends" && (
        <div className="space-y-3">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendCard key={friend.userId} friend={friend} />
            ))
          ) : friends.length > 0 ? (
            <div className="text-center py-8">
              <MagnifyingGlassIcon className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-white mb-2">
                No friends found
              </h4>
              <p className="text-neutral-400">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlusIcon className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-white mb-2">
                No friends yet
              </h4>
              <p className="text-neutral-400 mb-4">
                Add friends to see their learning progress and compete!
              </p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Find Friends
              </button>
            </div>
          )}
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          {friendRequests.length > 0 ? (
            friendRequests.map((request) => (
              <FriendCard key={request.userId} friend={request} />
            ))
          ) : (
            <div className="text-center py-8">
              <CheckIcon className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-white mb-2">
                No pending requests
              </h4>
              <p className="text-neutral-400">You're all caught up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
