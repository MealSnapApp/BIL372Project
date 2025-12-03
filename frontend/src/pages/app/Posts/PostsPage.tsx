import React, { useEffect, useState } from 'react';
import { Select, Modal, Input, Button, message } from 'antd';
import { UserOutlined, HeartFilled, HeartOutlined, DeleteOutlined, EditOutlined, SaveOutlined, EyeOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { getRecentPosts, likePost, unlikePost, listSavedPosts, bookmarkPost, unbookmarkPost, updatePost, listPostLikes, listComments, addComment } from '../../../services/PostServices/PostService';
import axiosInstance from '../../../axios/axiosInstance';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { followUser, unfollowUser, isFollowing } from '../../../services/FollowerServices/FollowerService';
import { useSearchParams } from 'react-router-dom';
import { notification } from 'antd';
const { TextArea } = Input;

const PostsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || undefined;
  const typeParam = searchParams.get('type') || undefined;
  const periodParam = searchParams.get('period') || 'all-time';
  const filterParam = searchParams.get('filter');

  const [posts, setPosts] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string|null>(null);
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});
  const [postFilter, setPostFilter] = useState<'all'|'mine'|'others'>(() => {
    if (filterParam && (filterParam === 'mine' || filterParam === 'others' || filterParam === 'all')) {
      return filterParam as any;
    }
    const v = localStorage.getItem('posts.postFilter');
    return (v === 'mine' || v === 'others' || v === 'all') ? v : 'all';
  });

  useEffect(() => {
    if (filterParam && (filterParam === 'mine' || filterParam === 'others' || filterParam === 'all')) {
      setPostFilter(filterParam as any);
    }
  }, [filterParam]);
  const [editOpen, setEditOpen] = useState<{open:boolean; post:any|null}>({open:false, post:null});
  const [likesModal, setLikesModal] = useState<{open:boolean; users:any[]; postId:string|null}>({open:false, users:[], postId:null});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [loadingComments, setLoadingComments] = useState<Record<string,boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string,any[]>>({});
  const [replyTarget, setReplyTarget] = useState<Record<string,string|null>>({});
  const [showCommentBox, setShowCommentBox] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string,string>>({});

  const loadPosts = async () => {
    try {
      const resp = await getRecentPosts(100, periodParam, categoryParam, typeParam);
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
  }, [categoryParam, typeParam, periodParam]);

  useEffect(() => {
    localStorage.setItem('posts.postFilter', postFilter);
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

  const toggleBookmark = async (post:any) => {
    const post_id = post.post_id;
    const isBookmarked = !!post._bookmarked;
    const resp = isBookmarked ? await unbookmarkPost(post_id) : await bookmarkPost(post_id);
    if (resp?.success) {
      setPosts(prev => prev.map(p => p.post_id===post_id ? { ...p, _bookmarked: !isBookmarked } : p));
      notification.success({
        message: !isBookmarked ? 'Post saved' : 'Post unsaved',
        placement: 'bottomLeft'
      });
    }
  };

  const handleEditOk = async () => {
    const post = editOpen.post;
    if (!post) return;
    const resp = await updatePost(post.post_id, { content: post._draftContent ?? post.content });
    if (resp?.success) {
      setPosts(prev => prev.map(p => p.post_id===post.post_id ? { ...p, content: post._draftContent ?? post.content } : p));
      setEditOpen({ open:false, post:null });
    }
  };

  const deletePost = async (post_id: string) => {
    try {
      const resp = await axiosInstance.delete(`/posts/${post_id}`);
      if (resp?.status === 200) {
        setPosts(prev => prev.filter(p => p.post_id !== post_id));
      }
    } catch {}
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
    const text = commentInputs[post_id] || '';
    const targetParent = parent_comment_id ?? replyTarget[post_id] ?? undefined;
    if (!text.trim()) return;
    const resp = await addComment(post_id, text.trim(), targetParent);
    if (resp.success) {
      setCommentInputs(i => ({...i, [post_id]: ''}));
      setReplyTarget(rt => ({ ...rt, [post_id]: null }));
      fetchComments(post_id);
    }
  };

  // Recursive renderer for nested comments
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
        >Cevapla</button>
        {Array.isArray(c.replies) && c.replies.length > 0 && (
          <div>
            {renderComments(c.replies, post_id, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="home-page-container" style={{ paddingTop: 16 }}>


      <div
        className="feed-grid"
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gridAutoFlow: 'dense',
          gap: 12,
          maxWidth: 1000,
          width: '100%'
        }}
      >
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
              <div
                key={p.post_id}
                className="post-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {imgSrc && (
                  <div className="post-image" style={{ lineHeight: 0 }}>
                    <img src={imgSrc} alt="post" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
                {p.content && (
                  <div
                    className="post-content"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
                    {p.content}
                  </div>
                )}
                <div className="post-user">
                  <div className="avatar"><UserOutlined /></div>
                  <div>@{username}</div>
                </div>
                <div className="post-actions" style={{ flexWrap: 'wrap' }}>
                  <button className={`btn-like ${p._liked ? 'liked' : ''}`} onClick={() => toggleLike(p)}>
                    {p._liked ? <HeartFilled /> : <HeartOutlined />}
                  </button>
                  <span className="like-count">
                    {(p.like_count || 0)} Likes
                  </span>
                  <Button
                    size="small"
                    onClick={() => fetchLikes(p.post_id)}
                    title="View Likes"
                    style={{ borderColor:'#1677ff', color:'#1677ff' }}
                  >
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
                {/* Comments */}
                {(showCommentBox[p.post_id] || (Array.isArray(commentsMap[p.post_id]) && commentsMap[p.post_id].length > 0)) && (
                  <div style={{ marginTop:8 }}>
                    {!showCommentBox[p.post_id] && (
                      <button className="comment-toggle" onClick={() => { setShowCommentBox(sc => ({ ...sc, [p.post_id]: true })); fetchComments(p.post_id); }}>
                        Yorum yaz
                      </button>
                    )}
                    {showCommentBox[p.post_id] && (
                      <>
                        <textarea className="comment-area"
                          placeholder="Yorum yaz..."
                          value={commentInputs[p.post_id] || ''}
                          onChange={(e) => setCommentInputs(ci => ({...ci, [p.post_id]: e.target.value}))}
                        />
                        {replyTarget[p.post_id] && (
                          <div style={{ fontSize:11, color:'#555', marginTop:4 }}>
                            Bir yoruma cevap veriliyor.
                            <button
                              style={{ fontSize:11, padding:0, marginLeft:6, color:'#1677ff', background:'transparent', border:'none', cursor:'pointer' }}
                              onClick={() => setReplyTarget(rt => ({ ...rt, [p.post_id]: null }))}
                            >İptal</button>
                          </div>
                        )}
                        <div className="comment-actions">
                          <button
                            style={{ fontSize:12, padding:'4px 8px', cursor:'pointer' }}
                            onClick={() => submitComment(p.post_id)}
                          >Gönder</button>
                          <button
                            style={{ fontSize:12, padding:'4px 8px', cursor:'pointer' }}
                            onClick={() => {
                              setShowCommentBox(sc => ({ ...sc, [p.post_id]: false }));
                              setReplyTarget(rt => ({ ...rt, [p.post_id]: null }));
                            }}
                          >Kapat</button>
                        </div>
                      </>
                    )}
                  </div>
                )}

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
            <div key={l.like_id} className="modal-like-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', color:'#fff', borderBottom:'1px solid #1f1f1f' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', color:'#bbb' }}>
                  <UserOutlined />
                </div>
                <div style={{ color:'#fff', fontWeight:600, fontSize:14 }}>@{uname}</div>
              </div>
              {uid && currentUserId && uid !== currentUserId && (
                <button className={isF ? 'follow-btn following' : 'follow-btn follow'} onClick={onClick} style={{ color: isF ? '#1677ff' : '#fff', border:'1px solid #3a3a3a', background:'transparent', padding:'6px 10px', borderRadius:6 }}>
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

export default PostsPage;
