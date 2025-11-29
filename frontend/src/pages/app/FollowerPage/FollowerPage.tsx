import React from 'react';
import './FollowerPage.css';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import useFollowerPage, { FollowerUser, FollowerPageProps } from './FollowerPage.logic';

const FollowerPage: React.FC<FollowerPageProps> = (props) => {
  const {
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
  } = useFollowerPage(props);

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
              {currentUserId && user.user_id !== currentUserId && (
                <button 
                  className={`follow-btn ${followStatus[user.user_id] ? 'following' : ''}`}
                  onClick={() => handleFollowClick(user.user_id)}
                >
                  {followStatus[user.user_id] ? "Following" : "Follow"}
                </button>
              )}
              
              {isFollowersTab && userId === currentUserId && (
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
          placeholder="Search users..." 
          prefix={<SearchOutlined />} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {isSearching ? (
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
              activeTab === 'followers' 
                ? renderUserList(followers, true)
                : renderUserList(following)
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FollowerPage;

