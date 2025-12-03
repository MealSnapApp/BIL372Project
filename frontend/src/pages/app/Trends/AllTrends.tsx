import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { UserOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { getRecentPosts, likePost, unlikePost, listSavedPosts, updatePost } from '../../../services/PostServices/PostService';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';

const AllTrends: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string|null>(null);
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});
  const [postFilter, setPostFilter] = useState<'all'|'mine'|'others'>(() => {
    const v = localStorage.getItem('trends.postFilter');
    return (v === 'mine' || v === 'others' || v === 'all') ? v : 'all';
  });
  const [editOpen, setEditOpen] = useState<{open:boolean; post:any|null}>({open:false, post:null});

  const loadPosts = async () => {
    try {
      const resp = await getRecentPosts(100);
      if (resp.success) {
        const payload = resp.data?.data;
        const arr = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        try {
          const savedResp = await listSavedPosts();
          const body = savedResp?.data?.data;
          const savedArr = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
          const savedIds = new Set(savedArr.map((p:any) => p.post_id));
          setPosts(arr.map((p:any) => ({ ...p, _bookmarked: savedIds.has(p.post_id) })));
        } catch {
          setPosts(arr);
        }
      }
    } catch {}
  };

  useEffect(() => {
    (async () => {
      try { const resp: any = await checkAuth(); const uid = resp?.data?.data?.user?.user_id; if (uid) setCurrentUserId(uid); } catch {}
      loadPosts();
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('trends.postFilter', postFilter);
  }, [postFilter]);

  const toggleLike = async (post:any) => {
    const post_id = post.post_id;
    if (likingMap[post_id]) return;
    setLikingMap(m => ({ ...m, [post_id]: true }));
    const wasLiked = !!post._liked;
    const nextLiked = !wasLiked;
    const resp = wasLiked ? await unlikePost(post_id) : await likePost(post_id);
    if (resp.success) {
      setPosts(prev => prev.map(p => {
        if (p.post_id !== post_id) return p;
        const currentCount = p.like_count || 0;
        const delta = nextLiked ? 1 : -1;
        const newCount = Math.max(0, currentCount + delta);
        return { ...p, like_count: newCount, _liked: nextLiked };
      }));
    }
    setLikingMap(m => ({ ...m, [post_id]: false }));
  };

  return (
    <div className="home-page-container" style={{ paddingTop: 16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:12, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#555' }}>Filter:</div>
        <Select
          size="small"
          value={postFilter}
          style={{ width: 200 }}
          onChange={(val) => setPostFilter(val as 'all'|'mine'|'others')}
          options={[
            { value: 'all', label: 'All Posts' },
            { value: 'mine', label: 'My Posts' },
            { value: 'others', label: "Other User's Posts" },
          ]}
        />
      </div>

      <div className="feed-grid" style={{ marginTop: 12 }}>
        {Array.isArray(posts) && posts
          .filter((p) => {
            if (postFilter === 'all') return true;
            const ownerId = p.user_id || p?.User?.user_id;
            if (!currentUserId) return true; // until auth loads, show all
            return postFilter === 'mine' ? ownerId === currentUserId : ownerId !== currentUserId;
          })
          .sort((a, b) => (Number(b.like_count || 0) - Number(a.like_count || 0)))
          .map((p) => {
            const user = p.User || p.User?.dataValues || p.user;
            const username = user?.username ?? 'Unknown';
            const rawImg = p.thumb_path || p.image_path;
            const imgSrc = rawImg && (rawImg.startsWith('http') ? rawImg : `http://localhost:3001${rawImg}`);
            return (
              <div key={p.post_id} className="post-card">
                {imgSrc && (
                  <div className="post-image">
                    <img src={imgSrc} alt="post" />
                  </div>
                )}
                {p.content && (
                  <div className="post-content">{p.content}</div>
                )}
                <div className="post-user">
                  <div className="avatar"><UserOutlined /></div>
                  <div>@{username}</div>
                </div>
                <div className="post-actions">
                  <button className={`btn-like ${p._liked ? 'liked' : ''}`} onClick={() => toggleLike(p)}>
                    {p._liked ? <HeartFilled /> : <HeartOutlined />} {p._liked ? 'Unlike' : 'Like'}
                  </button>
                  <span className="like-count">
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

export default AllTrends;
