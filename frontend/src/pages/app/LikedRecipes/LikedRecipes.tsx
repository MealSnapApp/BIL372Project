import React, { useEffect, useState } from 'react';
import { listLikedPosts, likePost, unlikePost } from '../../../services/PostServices/PostService';
import { HeartFilled, UserOutlined } from '@ant-design/icons';
import '../SavedRecipes/SavedRecipes.css';

const LikedRecipes: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});

  const load = async () => {
    const resp = await listLikedPosts();
    if (resp?.success) {
      const body = resp.data?.data; // { count, data }
      const arr = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      setItems(arr);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleLike = async (post:any) => {
    const post_id = post.post_id;
    if (likingMap[post_id]) return;
    setLikingMap(m => ({ ...m, [post_id]: true }));
    const wasLiked = post._liked ?? true;
    const nextLiked = !wasLiked;
    const resp = wasLiked ? await unlikePost(post_id) : await likePost(post_id);
    if (resp?.success) {
      if (wasLiked) {
        setItems(prev => prev.filter(p => p.post_id !== post_id));
      } else {
        load();
      }
    }
    setLikingMap(m => ({ ...m, [post_id]: false }));
  };

  return (
    <div className="saved-recipes-page">
      <h2 className="sr-title">Liked Posts</h2>
      {items.length === 0 && (
        <div style={{ color:'#d1d1d6', marginTop: 8 }}>You have no liked posts.</div>
      )}
      <div className="feed-grid sr-grid">
        {items.map(p => {
          const user = p.User || p.user;
          const username = user?.username ?? 'Unknown';
          const rawImg = p.thumb_path || p.image_path;
          const imgSrc = rawImg && (rawImg.startsWith('http') ? rawImg : `http://localhost:3001${rawImg}`);
          return (
            <div key={p.post_id} className="post-card sr-card">
              {imgSrc && (
                <div className="post-image sr-image">
                  <img src={imgSrc} alt="post" />
                </div>
              )}
              {p.content && (
                <div className="post-content sr-content">{p.content}</div>
              )}
              <div className="post-user sr-user">
                <div className="avatar"><UserOutlined /></div>
                <div>@{username}</div>
              </div>
              <div className="post-actions sr-actions">
                <button className={`btn-like sr-like liked`} onClick={() => toggleLike(p)}>
                  <HeartFilled /> Unlike
                </button>
                <span className="sr-like-count">
                  <HeartFilled style={{ color:'#ef4444' }} />{p.like_count || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LikedRecipes;
