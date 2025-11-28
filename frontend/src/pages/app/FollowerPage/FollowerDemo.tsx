import React, { useState } from 'react';
import './FollowerDemo.css';

interface DemoUser {
  user_id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
}

const FollowerDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>({
    'user2': true,
    'user3': false,
    'user4': true,
  });

  // Mock followers data
  const mockFollowers: DemoUser[] = [
    {
      user_id: 'user2',
      name: 'Ahmet',
      surname: 'Yılmaz',
      username: 'ahmetyilmaz',
      email: 'ahmet@example.com',
    },
    {
      user_id: 'user3',
      name: 'Fatih',
      surname: 'Kara',
      username: 'fatihkara',
      email: 'fatih@example.com',
    },
    {
      user_id: 'user4',
      name: 'Zeynep',
      surname: 'Demir',
      username: 'zeynepdemir',
      email: 'zeynep@example.com',
    },
  ];

  // Mock following data
  const mockFollowing: DemoUser[] = [
    {
      user_id: 'user5',
      name: 'Mehmet',
      surname: 'Çelik',
      username: 'mehmetcelik',
      email: 'mehmet@example.com',
    },
    {
      user_id: 'user6',
      name: 'Ayşe',
      surname: 'Güzel',
      username: 'ayseGuzel',
      email: 'ayse@example.com',
    },
  ];

  const handleFollowClick = (userId: string) => {
    setIsFollowing({
      ...isFollowing,
      [userId]: !isFollowing[userId],
    });
  };

  const renderUserList = (users: DemoUser[]) => {
    return (
      <div className="user-list">
        {users.map((user) => (
          <div key={user.user_id} className="user-card">
            <div className="user-info">
              <div className="user-name">{user.name} {user.surname}</div>
              <div className="user-username">@{user.username}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button
              className={`follow-btn ${isFollowing[user.user_id] ? 'following' : ''}`}
              onClick={() => handleFollowClick(user.user_id)}
            >
              {isFollowing[user.user_id] ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="follower-page">
      <div className="demo-header">
        <h1>Follower Sistemi - Demo</h1>
        <p>Veritabanı olmadan görsel demo</p>
      </div>

      <div className="follower-stats">
        <div className="stat-item">
          <div className="stat-value">{mockFollowers.length}</div>
          <div className="stat-label">Takipçi</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-value">{mockFollowing.length}</div>
          <div className="stat-label">Takip Edilen</div>
        </div>
      </div>

      <div className="follower-tabs">
        <button
          className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Takipçiler ({mockFollowers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Takip Ettikleri ({mockFollowing.length})
        </button>
      </div>

      <div className="follower-content">
        {activeTab === 'followers' && renderUserList(mockFollowers)}
        {activeTab === 'following' && renderUserList(mockFollowing)}
      </div>
    </div>
  );
};

export default FollowerDemo;
