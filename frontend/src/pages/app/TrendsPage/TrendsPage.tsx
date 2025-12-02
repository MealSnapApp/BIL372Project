import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './TrendsPage.css';
import { Button, Modal, Input, message } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { getRecentPosts, likePost, unlikePost, listPostLikes, listComments, addComment } from '../../../services/PostServices/PostService';
import { followUser, unfollowUser, isFollowing } from '../../../services/FollowerServices/FollowerService';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';

const TrendsPage = () => {
  const location = useLocation();
  const [posts, setPosts] = useState<any[]>([]);
  const [likesModal, setLikesModal] = useState<{open:boolean; users:any[]; postId:string|null}>({open:false, users:[], postId:null});
  const [commentInputs, setCommentInputs] = useState<Record<string,string>>({});
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [loadingComments, setLoadingComments] = useState<Record<string,boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string,any[]>>({});
  const [replyTarget, setReplyTarget] = useState<Record<string,string|null>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCommentBox, setShowCommentBox] = useState<Record<string, boolean>>({});

  const loadPosts = async () => {
    const searchParams = new URLSearchParams(location.search);
    const period = searchParams.get('period') || 'all-time';
    try {
      const resp = await getRecentPosts(50, period);
      if (resp.success) {
        const payload = resp.data?.data;
        const arr = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

        setPosts(arr);
        // Postlar yüklenince yorumları otomatik olarak getir
        arr.forEach((p:any) => {
          if (p?.post_id) {
            fetchComments(p.post_id);
          }
        });
      }
    } catch (e) {
      // noop
    }
  };

  const fetchLikes = async (post_id:string) => {
    setLoadingLikes(true);
    try {
      // currentUserId yoksa önce kimlik doğrulamayı kontrol et
      if (!currentUserId) {
        try {
          const respAuth: any = await checkAuth();
          const uid = respAuth?.data?.user?.user_id || respAuth?.user?.user_id;
          if (uid) setCurrentUserId(uid);
        } catch {}
      }
      const resp = await listPostLikes(post_id);
      if (resp.success) {
        let users = resp.data.data?.data || resp.data.data || [];
        // Kendi hesabını en üste yerleştir (varsa)
        if (currentUserId) {
          users = [...users].sort((a:any, b:any) => {
            const aMe = a?.User?.user_id === currentUserId ? 0 : 1;
            const bMe = b?.User?.user_id === currentUserId ? 0 : 1;
            return aMe - bMe;
          });
        }
        setLikesModal({ open: true, users, postId: post_id });
        // Kullanıcıların takip durumlarını çek
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

  const toggleLike = async (post:any) => {
    const isLiked = post._liked; // local flag
    const post_id = post.post_id;
    let resp;
    if (isLiked) resp = await unlikePost(post_id); else resp = await likePost(post_id);
    if (resp.success) {
      setPosts(prev => prev.map(p => p.post_id===post_id ? {
        ...p,
        like_count: (p.like_count || 0) + (isLiked ? -1 : 1),
        _liked: !isLiked
      } : p));
    }
  };

  const fetchComments = async (post_id:string) => {
    setLoadingComments(c => ({...c, [post_id]: true}));
    try {
      const resp = await listComments(post_id);
      if (resp.success) {
        setCommentsMap(m => ({...m, [post_id]: resp.data.data?.data || resp.data.data || [] }));
      }
    } finally {
      setLoadingComments(c => ({...c, [post_id]: false}));
    }
  };

  const submitComment = async (post_id:string, parent_comment_id?:string) => {
    const content = commentInputs[post_id] || '';
    if (!content.trim()) return;
    // Eğer parametre verilmemişse, bu post için seçili reply hedefini kullan
    const targetParent = parent_comment_id ?? replyTarget[post_id] ?? undefined;
    const resp = await addComment(post_id, content.trim(), targetParent);
    if (resp.success) {
      setCommentInputs(i => ({...i, [post_id]: ''}));
      // Gönderim sonrası replyTarget'ı temizle
      setReplyTarget(rt => ({ ...rt, [post_id]: null }));
      fetchComments(post_id);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const resp: any = await checkAuth();
        const uid = resp?.data?.user?.user_id || resp?.user?.user_id;
        if (uid) setCurrentUserId(uid);
      } catch {}
      loadPosts();
    })();
  }, [location.search]);

  // Yorumları sınırsız derinlikte render eden yardımcı
  const renderComments = (items: any[], post_id: string, level = 0) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return items.map((c) => (
      <div key={c.comment_id} style={{ marginLeft: level ? 12 : 0, marginTop: level ? 4 : 0, marginBottom: 6 }}>
        <div style={{ fontSize:11, fontWeight:600 }}>@{c.User?.username}</div>
        <div style={{ fontSize:12, whiteSpace:'pre-wrap' }}>{c.content}</div>
        <button
          style={{ fontSize:11, cursor:'pointer', marginTop:2 }}
          onClick={() => {
            setReplyTarget(rt => ({ ...rt, [post_id]: c.comment_id }));
            setShowCommentBox(sc => ({ ...sc, [post_id]: true }));
          }}
        >Reply</button>
        {Array.isArray(c.replies) && c.replies.length > 0 && (
          <div>
            {renderComments(c.replies, post_id, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const getTitle = () => {
    const searchParams = new URLSearchParams(location.search);
    const period = searchParams.get('period');
    switch(period) {
      case 'daily': return 'Daily Trends';
      case 'weekly': return 'Weekly Trends';
      case 'monthly': return 'Monthly Trends';
      case 'annual': return 'Annual Trends';
      default: return 'All Time Trends';
    }
  };

  return (
    <div className="trends-page-container">
      <div className="welcome-section">
        <h1>{getTitle()}</h1>
        <p>Discover what others are eating.</p>
      </div>

      <div className="feed-grid" style={{ marginTop: 24 }}>
        {Array.isArray(posts) && posts.map((p) => {
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
                <span style={{ fontSize:12, color:'#444' }}>
                  <HeartFilled style={{ color:'#ef4444', marginRight:4 }} />{p.like_count || 0}
                </span>
                <button className="btn-secondary" onClick={() => fetchLikes(p.post_id)}>
                  Likes
                </button>
              </div>
              <div style={{ marginTop:8 }}>
                {!showCommentBox[p.post_id] && (
                  <button className="comment-toggle" onClick={() => setShowCommentBox(sc => ({ ...sc, [p.post_id]: true }))}>
                    <MessageOutlined style={{ marginRight:6 }} />Write a comment
                  </button>
                )}
                {showCommentBox[p.post_id] && (
                  <>
                    <textarea className="comment-area"
                      placeholder="Write a comment..."
                      value={commentInputs[p.post_id] || ''}
                      onChange={(e) => setCommentInputs(ci => ({...ci, [p.post_id]: e.target.value}))}
                    />
                    {replyTarget[p.post_id] && (
                      <div style={{ fontSize:11, color:'#555', marginTop:4 }}>
                        Replying to a comment.
                        <button
                          style={{ fontSize:11, padding:0, marginLeft:6, color:'#1677ff', background:'transparent', border:'none', cursor:'pointer' }}
                          onClick={() => setReplyTarget(rt => ({ ...rt, [p.post_id]: null }))}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <div className="comment-actions">
                      <button
                        style={{ fontSize:12, padding:'4px 8px', cursor:'pointer' }}
                        onClick={() => submitComment(p.post_id)}
                      >Send</button>
                      <button
                        style={{ fontSize:12, padding:'4px 8px', cursor:'pointer' }}
                        onClick={() => {
                          setShowCommentBox(sc => ({ ...sc, [p.post_id]: false }));
                          setReplyTarget(rt => ({ ...rt, [p.post_id]: null }));
                        }}
                      >Close</button>
                    </div>
                  </>
                )}
              </div>
              { Array.isArray(commentsMap[p.post_id]) && commentsMap[p.post_id].length > 0 && (
                <div style={{ marginTop:8 }}>
                  {renderComments(commentsMap[p.post_id], p.post_id, 0)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Modal
        title="Liked by"
        open={likesModal.open}
        onCancel={() => setLikesModal({open:false, users:[], postId:null})}
        footer={null}
      >
        {loadingLikes && <div>Loading...</div>}
        {!loadingLikes && likesModal.users.length === 0 && <div>No likes yet.</div>}
        {!loadingLikes && likesModal.users.map(l => {
          const u = l.User;
          const uid = u?.user_id;
          const uname = u?.username;
          const isF = uid ? !!followingMap[uid] : false;
          const btnClass = isF ? 'follow-btn following' : 'follow-btn follow';
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
            <div key={l.like_id} className="modal-like-row">
              <div>@{uname}</div>
              {uid && currentUserId && uid !== currentUserId && (
                <button className={btnClass} onClick={onClick}>{isF ? 'Following' : 'Follow'}</button>
              )}
            </div>
          );
        })}
      </Modal>
    </div>
  );
};

export default TrendsPage;
