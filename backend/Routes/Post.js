const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const { createPost, listRecentPosts, updatePost, listMyPosts, deletePost } = require('../Controllers/PostController');
const { likePost, unlikePost, listPostLikes, listLikedPosts } = require('../Controllers/PostLikeController');
const { bookmarkPost, unbookmarkPost, listSavedPosts } = require('../Controllers/PostBookmarkController');
const { addComment, listComments } = require('../Controllers/CommentController');

const router = express.Router();

// Create post
router.post('/', authenticateToken, createPost);
// Update post
router.put('/:post_id', authenticateToken, updatePost);
// Delete post
router.delete('/:post_id', authenticateToken, deletePost);

// List recent posts (optional helper)
router.get('/', authenticateToken, listRecentPosts);
// List my posts
router.get('/mine', authenticateToken, listMyPosts);

// Likes
router.post('/:post_id/like', authenticateToken, likePost);
router.delete('/:post_id/like', authenticateToken, unlikePost);
router.get('/:post_id/likes', authenticateToken, listPostLikes);
router.get('/liked', authenticateToken, listLikedPosts);

// Bookmarks
router.post('/:post_id/bookmark', authenticateToken, bookmarkPost);
router.delete('/:post_id/bookmark', authenticateToken, unbookmarkPost);
router.get('/saved', authenticateToken, listSavedPosts);

// Comments
router.post('/:post_id/comments', authenticateToken, addComment);
router.get('/:post_id/comments', authenticateToken, listComments);

module.exports = router;
