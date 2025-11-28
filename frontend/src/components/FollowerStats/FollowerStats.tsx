import React, { useEffect, useState } from 'react';
import { getFollowers, getFollowing } from '../../services/FollowerServices/FollowerService';
import './FollowerStats.css';

interface FollowerStatsProps {
  userId: string;
}

const FollowerStats: React.FC<FollowerStatsProps> = ({ userId }) => {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
      ]);

      setFollowersCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
    } catch (error) {
      console.error('Error fetching follower stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="follower-stats loading">Yükleniyor...</div>;
  }

  return (
    <div className="follower-stats">
      <div className="stat-item">
        <div className="stat-value">{followersCount}</div>
        <div className="stat-label">Takipçi</div>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-item">
        <div className="stat-value">{followingCount}</div>
        <div className="stat-label">Takip Edilen</div>
      </div>
    </div>
  );
};

export default FollowerStats;
