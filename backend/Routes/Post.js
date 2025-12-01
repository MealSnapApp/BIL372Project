const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const { createPost, listRecentPosts } = require('../Controllers/PostController');
const { likePost, unlikePost, listPostLikes } = require('../Controllers/PostLikeController');
const { addComment, listComments } = require('../Controllers/CommentController');

const router = express.Router();

// Create post
router.post('/', authenticateToken, createPost);

// List recent posts (optional helper)
router.get('/', authenticateToken, listRecentPosts);

// Likes
router.post('/:post_id/like', authenticateToken, likePost);
router.delete('/:post_id/like', authenticateToken, unlikePost);
router.get('/:post_id/likes', authenticateToken, listPostLikes);

// Comments
router.post('/:post_id/comments', authenticateToken, addComment);
router.get('/:post_id/comments', authenticateToken, listComments);

module.exports = router;
