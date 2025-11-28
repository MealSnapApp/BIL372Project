import React, { useEffect, useState } from 'react';
import { getFollowers, getFollowing, followUser, unfollowUser, removeFollower } from '../../../services/FollowerServices/FollowerService';
import { searchUsers } from '../../../services/UserServices/UserService';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import './FollowerPage.css';
import { ToastMessage } from '../../../utils/ToastMessage/ToastMessage';
import { Input, Button, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface FollowerUser {
  user_id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
}

interface FollowerPageProps {
  userId: string;
  currentUserId?: string;
}

const FollowerPage: React.FC<FollowerPageProps> = ({ userId: propUserId, currentUserId: propCurrentUserId }) => {
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
        // Update follow status for search results
        if (currentUserId) {
            // We need to know if we follow these people
            // We can reuse the 'following' list if it's already loaded, 
            // but to be safe/accurate, we might want to rely on the 'followStatus' map we built in fetchFollowerData.
            // However, search results might contain people NOT in our followers/following lists.
            // So we should ideally check status for them. 
            // For simplicity, we'll assume 'followStatus' has the info if we loaded the page.
            // But if we search for a stranger, followStatus[strangerId] will be undefined (falsy), which is correct (we don't follow them).
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      // setIsSearching(false); // Keep it true to show results UI
    }
  };

  const fetchFollowerData = async () => {
    setLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
      ]);

      // getFollowers returns items with 'followingUser' (the person following me)
      const followersList = followersRes.data.map((f: any) => f.followingUser);
      // getFollowing returns items with 'followedUser' (the person I am following)
      const followingList = followingRes.data.map((f: any) => f.followedUser);

      setFollowers(followersList);
      setFollowing(followingList);

      // Calculate follow status for the current user
      if (currentUserId) {
        let myFollowingIds = new Set<string>();

        if (userId === currentUserId) {
          // If viewing my own profile, I follow everyone in the 'followingList'
          followingList.forEach((u: FollowerUser) => myFollowingIds.add(u.user_id));
        } else {
          // If viewing someone else's profile, I need to fetch who I follow
          const myFollowingRes = await getFollowing(currentUserId);
          myFollowingRes.data.forEach((f: any) => {
             myFollowingIds.add(f.followedUser.user_id);
          });
        }

        const newFollowStatus: { [key: string]: boolean } = {};
        
        // Mark status for all users in both lists
        [...followersList, ...followingList].forEach((u: FollowerUser) => {
            newFollowStatus[u.user_id] = myFollowingIds.has(u.user_id);
        });
        
        // Also preserve existing status (e.g. from search)
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
      // Refresh lists if we are not searching
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

  const renderUserList = (users: FollowerUser[], isFollowersTab: boolean = false) => {
    if (users.length === 0) {
      return <div className="empty-message">No users found</div>;
    }

    return (
      <div className="user-list">
        {users.map((user) => (
          <div key={user.user_id} className="user-card">
            <div className="user-info">
              <div className="user-name">{user.name} {user.surname}</div>
              <div className="user-username">@{user.username}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <div className="user-actions">
                {currentUserId && currentUserId !== user.user_id && (
                <button
                    className={`follow-btn ${followStatus[user.user_id] ? 'following' : ''}`}
                    onClick={() => handleFollowClick(user.user_id)}
                >
                    {followStatus[user.user_id] ? 'Following' : 'Follow'}
                </button>
                )}
                
                {/* Show Remove button only if:
                    1. We are in the "Followers" tab
                    2. We are viewing our own profile (currentUserId == userId)
                */}
                {isFollowersTab && currentUserId === userId && (
                    <button 
                        className="remove-btn"
                        onClick={() => handleRemoveFollower(user.user_id)}
                    >
                        Remove
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="follower-page">
      {contextHolder}

      <div className="search-section">
        <Input 
            placeholder="Search users to follow..." 
            prefix={<SearchOutlined />} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
        />
      </div>

      {searchQuery ? (
          <div className="follower-content">
              <h3>Search Results</h3>
              {renderUserList(searchResults)}
          </div>
      ) : (
        <>
            <div className="follower-tabs">
                <button
                className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
                onClick={() => setActiveTab('followers')}
                >
                Followers ({followers.length})
                </button>
                <button
                className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                onClick={() => setActiveTab('following')}
                >
                Following ({following.length})
                </button>
            </div>

            <div className="follower-content">
                {loading ? (
                <div className="loading">Loading...</div>
                ) : (
                <>
                    {activeTab === 'followers' && renderUserList(followers, true)}
                    {activeTab === 'following' && renderUserList(following)}
                </>
                )}
            </div>
        </>
      )}
    </div>
  );
};

export default FollowerPage;

