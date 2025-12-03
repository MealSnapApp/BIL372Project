import React, { useEffect, useState } from 'react';
import { listLikedPosts, likePost, unlikePost, updatePost, listSavedPosts, listPostLikes } from '../../../services/PostServices/PostService';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { followUser, unfollowUser, isFollowing } from '../../../services/FollowerServices/FollowerService';
import { HeartFilled, HeartOutlined, UserOutlined } from '@ant-design/icons';
import { Modal, Input, Button, notification } from 'antd';
import axiosInstance from '../../../axios/axiosInstance';
import { SaveOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { bookmarkPost, unbookmarkPost } from '../../../services/PostServices/PostService';

const { TextArea } = Input;

const LikedPosts: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string|null>(null);
  const [editOpen, setEditOpen] = useState<{open:boolean; post:any|null}>({open:false, post:null});
  const [likesModal, setLikesModal] = useState<{open:boolean; users:any[]; postId:string|null}>({open:false, users:[], postId:null});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loadingLikes, setLoadingLikes] = useState(false);

  const load = async () => {
    const resp = await listLikedPosts();
    if (resp?.success) {
      const body = resp.data?.data;
      const arr = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      try {
        const savedResp = await listSavedPosts();
        const savedBody = savedResp?.data?.data;
        const savedArr = Array.isArray(savedBody?.data) ? savedBody.data : (Array.isArray(savedBody) ? savedBody : []);
        const savedIds = new Set(savedArr.map((p:any) => p.post_id));
        // These are liked posts; mark them as liked by current user
        setItems(arr.map((p:any) => ({ ...p, _bookmarked: savedIds.has(p.post_id), _liked: true })));
      } catch {
        setItems(arr.map((p:any) => ({ ...p, _bookmarked: !!p._bookmarked, _liked: true })));
      }
    }
  };

  const fetchLikes = async (post_id:string) => {
    setLoadingLikes(true);
    try {
      if (!currentUserId) {
        try { const respAuth:any = await checkAuth(); const uid = respAuth?.data?.data?.user?.user_id; if (uid) setCurrentUserId(uid); } catch {}
      }
      const resp = await listPostLikes(post_id);
      if (resp.success) {
        let users = resp.data.data?.data || resp.data.data || [];
        if (currentUserId) {
          users = [...users].sort((a:any, b:any) => {
            const aMe = a?.User?.user_id === currentUserId ? 0 : 1;
            const bMe = b?.User?.user_id === currentUserId ? 0 : 1;
            return aMe - bMe;
          });
        }
        setLikesModal({ open: true, users, postId: post_id });
        const entries = Array.isArray(users) ? users : [];
        for (const l of entries) {
          const uid = l?.User?.user_id;
          if (!uid) continue;
          try {
            const r = await isFollowing(uid);
            const val = !!(r?.data?.isFollowing ?? r?.isFollowing);
            setFollowingMap(m => ({ ...m, [uid]: val }));
          } catch {}
        }
      }
    } finally {
      setLoadingLikes(false);
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
      if (!nextLiked) {
        // When unliking from Liked Posts, remove from the list
        setItems(prev => prev.filter(p => p.post_id !== post_id));
      } else {
        setItems(prev => prev.map(p => p.post_id===post_id ? {
          ...p,
          like_count: Math.max(0, (p.like_count || 0) + 1),
          _liked: true
        } : p));
      }
      notification.success({
        message: nextLiked ? 'Post liked' : 'Post unliked',
        placement: 'bottomLeft'
      });
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

  const deletePost = async (post_id: string) => {
    try {
      const resp = await axiosInstance.delete(`/posts/${post_id}`);
      if (resp?.status === 200) {
        setItems(prev => prev.filter(p => p.post_id !== post_id));
      }
    } catch {}
  };

  const toggleBookmark = async (post:any) => {
    const post_id = post.post_id;
    const isBookmarked = !!post._bookmarked;
    const resp = isBookmarked ? await unbookmarkPost(post_id) : await bookmarkPost(post_id);
    if (resp?.success) {
      setItems(prev => prev.map(p => p.post_id===post_id ? { ...p, _bookmarked: !isBookmarked } : p));
      notification.success({
        message: !isBookmarked ? 'Post saved' : 'Post unsaved',
        placement: 'bottomLeft'
      });
    }
  };

  return (
    <div className="saved-recipes-page">
      <h2 className="sr-title">Liked Posts</h2>
      <div className="feed-grid sr-grid" style={{
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gridAutoFlow: 'dense',
        gap: 12,
        maxWidth: 1000,
        width: '100%'
      }}>
        {items.map(p => {
          const user = p.User || p.user;
          const username = user?.username ?? 'Unknown';
          const rawImg = p.thumb_path || p.image_path;
          const imgSrc = rawImg && (rawImg.startsWith('http') ? rawImg : `http://localhost:3001${rawImg}`);
          return (
            <div
              key={p.post_id}
              className="post-card sr-card"
              style={{ display:'flex', flexDirection:'column', gap:8 }}
            >
              {imgSrc && (
                <div className="post-image sr-image" style={{ lineHeight:0 }}>
                  <img src={imgSrc} alt="post" style={{ width:'100%', height:'auto', display:'block' }} />
                </div>
              )}
              {p.content && (
                <div className="post-content sr-content" style={{ whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'anywhere' }}>{p.content}</div>
              )}
              <div className="post-user sr-user">
                <div className="avatar"><UserOutlined /></div>
                <div>@{username}</div>
              </div>
              <div className="post-actions sr-actions" style={{ flexWrap:'wrap' }}>
                <button className={`btn-like sr-like ${p._liked ? 'liked' : ''}`} onClick={() => toggleLike(p)}>
                  {p._liked ? <HeartFilled style={{ color:'#ef4444' }} /> : <HeartOutlined />}
                </button>
                <span className="sr-like-count" style={{ display:'inline-flex', alignItems:'center' }}>
                  {(p.like_count || 0)} Likes
                </span>
                <Button size="small" title="View Likes" style={{ borderColor:'#1677ff', color:'#1677ff' }} onClick={() => fetchLikes(p.post_id)}>
                  <UsergroupAddOutlined />
                </Button>
                <Button
                  size="small"
                  onClick={() => toggleBookmark(p)}
                  title={p._bookmarked ? 'Unsave' : 'Save'}
                  style={{ borderColor:'#2ca50c', color: p._bookmarked ? '#fff' : '#2ca50c', backgroundColor: p._bookmarked ? '#2ca50c' : 'transparent' }}
                >
                  <SaveOutlined style={{ fontSize:16 }} />
                </Button>
                {currentUserId && (p.user_id === currentUserId || p?.User?.user_id === currentUserId) && (
                  <>
                    <Button size="small" onClick={() => setEditOpen({ open:true, post: { ...p, _draftContent: p.content } })} title="Edit">
                      <EditOutlined />
                    </Button>
                    <Button size="small" danger onClick={() => deletePost(p.post_id)} title="Delete">
                      <DeleteOutlined />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {items.length === 0 && (
        <div style={{ color:'#d1d1d6', marginTop: 8 }}>You have no liked posts.</div>
      )}
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

      <Modal
        title={<span style={{ color:'#fff', fontWeight:600 }}>Liked by</span>}
        open={likesModal.open}
        onCancel={() => setLikesModal({open:false, users:[], postId:null})}
        footer={<Button onClick={() => setLikesModal({open:false, users:[], postId:null})}>Close</Button>}
        bodyStyle={{ background:'#121212', color:'#fff' }}
        styles={{ header: { background:'#121212', color:'#fff' } as any }}
        maskStyle={{ backgroundColor:'rgba(0,0,0,0.65)' }}
        closable
        closeIcon={<span style={{ color:'#fff' }}>✕</span>}
        width={420}
        centered
      >
        {loadingLikes && <div style={{ color:'#fff', padding:'8px 0' }}>Loading...</div>}
        {!loadingLikes && likesModal.users.length === 0 && <div style={{ color:'#fff', padding:'8px 0' }}>No likes yet.</div>}
        {!loadingLikes && likesModal.users.map(l => {
          const u = l.User;
          const uid = u?.user_id;
          const uname = u?.username;
          const isF = uid ? !!followingMap[uid] : false;
          const onClick = async () => {
            if (!uid) return;
            try {
              if (isF) {
                await unfollowUser(uid);
                setFollowingMap(m => ({ ...m, [uid]: false }));
              } else {
                await followUser(uid);
                setFollowingMap(m => ({ ...m, [uid]: true }));
              }
            } catch {}
          };
          return (
            <div key={l.like_id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', color:'#fff', borderBottom:'1px solid #1f1f1f' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', color:'#bbb' }}>
                  <UserOutlined />
                </div>
                <div style={{ color:'#fff', fontWeight:600, fontSize:14 }}>@{uname}</div>
              </div>
              {uid && currentUserId && uid !== currentUserId && (
                <button onClick={onClick} style={{ color: isF ? '#1677ff' : '#fff', border:'1px solid #3a3a3a', background:'transparent', padding:'6px 10px', borderRadius:6 }}>
                  {isF ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          );
        })}
      </Modal>
    </div>
  );
};

export default LikedPosts;
