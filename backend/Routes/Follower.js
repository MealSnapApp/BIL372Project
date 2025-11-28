const express = require('express');
const router = express.Router();
const FollowerController = require('../Controllers/FollowerController');
const authenticateToken = require('../middlewares/authMiddleware');

// Follow a user - requires authentication
router.post('/follow', authenticateToken, FollowerController.follow);

// Unfollow a user - requires authentication
router.delete('/unfollow/:follower_user_id', authenticateToken, FollowerController.unfollow);

// Get followers of a user (public)
router.get('/followers/:user_id', FollowerController.getFollowers);

// Get following list of a user (public)
router.get('/following/:user_id', FollowerController.getFollowing);

// Check if authenticated user follows another user
router.get('/is-following/:follower_user_id', authenticateToken, FollowerController.isFollowing);

// Remove a follower (force unfollow) - requires authentication
router.delete('/remove/:user_id_to_remove', authenticateToken, FollowerController.removeFollower);

module.exports = router;
