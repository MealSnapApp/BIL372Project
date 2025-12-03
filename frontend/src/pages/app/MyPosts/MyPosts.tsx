import React, { useEffect, useState } from 'react';
import { listMyPosts, likePost, unlikePost, updatePost } from '../../../services/PostServices/PostService';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { HeartFilled, HeartOutlined, UserOutlined } from '@ant-design/icons';
import { Modal, Input } from 'antd';
import '../SavedRecipes/SavedRecipes.css';

const { TextArea } = Input;

const MyPosts: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string|null>(null);
  const [editOpen, setEditOpen] = useState<{open:boolean; post:any|null}>({open:false, post:null});

  const load = async () => {
    const resp = await listMyPosts();
    if (resp?.success) {
      const body = resp.data?.data; // { data }
      const arr = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      setItems(arr);
    }
  };

  useEffect(() => {
    (async () => {
      try { const resp:any = await checkAuth(); const uid = resp?.data?.data?.user?.user_id; if (uid) setCurrentUserId(uid); } catch {}
      load();
    })();
  }, []);

  const toggleLike = async (post:any) => {
    const post_id = post.post_id;
    if (likingMap[post_id]) return;
    setLikingMap(m => ({ ...m, [post_id]: true }));
    const wasLiked = !!post._liked;
    const nextLiked = !wasLiked;
    const resp = wasLiked ? await unlikePost(post_id) : await likePost(post_id);
    if (resp?.success) {
      setItems(prev => prev.map(p => p.post_id===post_id ? {
        ...p,
        like_count: Math.max(0, (p.like_count || 0) + (nextLiked ? 1 : -1)),
        _liked: nextLiked
      } : p));
    }
    setLikingMap(m => ({ ...m, [post_id]: false }));
  };

  const handleEditOk = async () => {
    const post = editOpen.post;
    if (!post) return;
    const resp = await updatePost(post.post_id, { content: post._draftContent ?? post.content });
    if (resp?.success) {
      setItems(prev => prev.map(p => p.post_id===post.post_id ? { ...p, content: post._draftContent ?? post.content } : p));
      setEditOpen({ open:false, post:null });
    }
  };

  return (
    <div className="saved-recipes-page">
      <h2 className="sr-title">My Posts</h2>
      {items.length === 0 && (
        <div style={{ color:'#d1d1d6', marginTop: 8 }}>You have no posts.</div>
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
                <button className={`btn-like sr-like ${p._liked ? 'liked' : ''}`} onClick={() => toggleLike(p)}>
                  {p._liked ? <HeartFilled /> : <HeartOutlined />} {p._liked ? 'Unlike' : 'Like'}
                </button>
                <span className="sr-like-count">
                  <HeartFilled style={{ color:'#ef4444', marginRight:4 }} />{p.like_count || 0}
                </span>
                {currentUserId && (p.user_id === currentUserId || p?.User?.user_id === currentUserId) && (
                  <button className="btn-like sr-like" style={{ marginLeft: 8 }} onClick={() => setEditOpen({ open:true, post: { ...p, _draftContent: p.content } })}>
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Modal
        title="Edit Post"
        open={editOpen.open}
        onOk={handleEditOk}
        onCancel={() => setEditOpen({ open:false, post:null })}
        okText="Save"
        cancelText="Cancel"
      >
        <TextArea
          rows={4}
          placeholder="Update content..."
          value={editOpen.post?._draftContent ?? ''}
          onChange={(e) => setEditOpen(prev => prev.post ? { open:true, post: { ...prev.post, _draftContent: e.target.value } } : prev)}
          style={{ marginBottom: 12 }}
        />
      </Modal>
    </div>
  );
};

export default MyPosts;
