import { useState, useEffect } from 'react';
import { getFollowers, getFollowing, followUser, unfollowUser, removeFollower } from '../../../services/FollowerServices/FollowerService';
import { searchUsers } from '../../../services/UserServices/UserService';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { ToastMessage } from '../../../utils/ToastMessage/ToastMessage';

export interface FollowerUser {
  user_id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
}

export interface FollowerPageProps {
  userId: string;
  currentUserId?: string;
}

const useFollowerPage = ({ userId: propUserId, currentUserId: propCurrentUserId }: FollowerPageProps) => {
  const [userId, setUserId] = useState<string>(propUserId);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(propCurrentUserId);
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [loading, setLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState<{ [key: string]: boolean }>({});
  const { contextHolder, showNotification } = ToastMessage();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FollowerUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (propUserId === 'current-user-id' || propCurrentUserId === 'current-user-id') {
        try {
          const response = await checkAuth();
          if (response && (response as any).success) {
            const user = (response as any).data.data.user;
            if (propUserId === 'current-user-id') {
              setUserId(user.user_id);
            }
            if (propCurrentUserId === 'current-user-id') {
              setCurrentUserId(user.user_id);
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [propUserId, propCurrentUserId]);

  useEffect(() => {
    if (userId && userId !== 'current-user-id') {
      fetchFollowerData();
    }
  }, [userId]);

  // Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await searchUsers(searchQuery);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const fetchFollowerData = async () => {
    setLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
      ]);

      const followersList = followersRes.data.map((f: any) => f.followingUser);
      const followingList = followingRes.data.map((f: any) => f.followedUser);

      setFollowers(followersList);
      setFollowing(followingList);

      if (currentUserId) {
        let myFollowingIds = new Set<string>();

        if (userId === currentUserId) {
          followingList.forEach((u: FollowerUser) => myFollowingIds.add(u.user_id));
        } else {
          const myFollowingRes = await getFollowing(currentUserId);
          myFollowingRes.data.forEach((f: any) => {
             myFollowingIds.add(f.followedUser.user_id);
          });
        }

        const newFollowStatus: { [key: string]: boolean } = {};
        
        [...followersList, ...followingList].forEach((u: FollowerUser) => {
            newFollowStatus[u.user_id] = myFollowingIds.has(u.user_id);
        });
        
        setFollowStatus(prev => ({ ...prev, ...newFollowStatus }));
      }
    } catch (error) {
      console.error('Error fetching follower data:', error);
      showNotification('Failed to load follower data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowClick = async (targetUserId: string) => {
    try {
      if (followStatus[targetUserId]) {
        await unfollowUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: false }));
        showNotification('Unfollowed successfully', 'success');
      } else {
        await followUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: true }));
        showNotification('Followed successfully', 'success');
      }
      if (!searchQuery) {
          fetchFollowerData();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showNotification('Operation failed', 'error');
    }
  };

  const handleRemoveFollower = async (followerId: string) => {
    try {
        await removeFollower(followerId);
        showNotification('Follower removed', 'success');
        fetchFollowerData();
    } catch (error) {
        console.error('Error removing follower:', error);
        showNotification('Failed to remove follower', 'error');
    }
  };

  return {
    userId,
    currentUserId,
    followers,
    following,
    activeTab,
    setActiveTab,
    loading,
    followStatus,
    contextHolder,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleFollowClick,
    handleRemoveFollower
  };
};

export default useFollowerPage;
