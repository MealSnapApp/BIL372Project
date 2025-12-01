const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { likeComment, unlikeComment, listCommentLikes } = require('../Controllers/CommentLikeController');

router.get('/comments/:comment_id/likes', authenticateToken, listCommentLikes);
router.post('/comments/:comment_id/like', authenticateToken, likeComment);
router.delete('/comments/:comment_id/like', authenticateToken, unlikeComment);

module.exports = router;
