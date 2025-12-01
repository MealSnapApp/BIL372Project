const Follower = require('../models/Follower');
const User = require('../models/User');

// Follow a user
const follow = async (req, res) => {
  try {
    const { followed_user_id: followed_user_id_body, follower_user_id: follower_user_id_body } = req.body;
    const followed_user_id = followed_user_id_body || follower_user_id_body;
    const user_id = req.user.id; // From auth middleware

    // Validate that user is not following themselves
    if (user_id === followed_user_id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follower.findOne({
      where: { user_id, followed_user_id },
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    const newFollow = await Follower.create({
      user_id,
      followed_user_id,
    });

    res.status(201).json({
      message: 'Successfully followed user',
      follower: newFollow,
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Error following user', error });
  }
};

// Unfollow a user
const unfollow = async (req, res) => {
  try {
    const { followed_user_id: followed_user_id_param, follower_user_id: follower_user_id_param } = req.params;
    const followed_user_id = followed_user_id_param || follower_user_id_param;
    const user_id = req.user.id;

    const follow = await Follower.findOne({
      where: { user_id, followed_user_id },
    });

    if (!follow) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    await follow.destroy();

    res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Error unfollowing user', error });
  }
};

// Get followers of a user (who follows this user)
const getFollowers = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log(`Getting followers for user_id: ${user_id}`);

    // Find rows where follower_user_id is the target user (me)
    // Include 'followingUser' (the person who is following me)
    const followers = await Follower.findAll({
      where: { followed_user_id: user_id },
      include: [
        {
          model: User,
          as: 'followingUser',
          attributes: ['user_id', 'name', 'surname', 'username', 'email'],
        },
      ],
    });

    console.log(`Found ${followers.length} followers`);

    res.status(200).json({
      message: 'Followers retrieved successfully',
      data: followers,
      count: followers.length,
    });
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({ message: 'Error getting followers', error: error.message, stack: error.stack });
  }
};

// Get following list of a user (who this user follows)
const getFollowing = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log(`Getting following for user_id: ${user_id}`);

    // Find rows where user_id is the actor (me)
    // Include 'followedUser' (the person I am following)
    const following = await Follower.findAll({
      where: { user_id: user_id }, 
      include: [
        {
          model: User,
          as: 'followedUser',
          attributes: ['user_id', 'name', 'surname', 'username', 'email'],
        },
      ],
    });

    console.log(`Found ${following.length} following`);

    res.status(200).json({
      message: 'Following list retrieved successfully',
      data: following,
      count: following.length,
    });
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json({ message: 'Error getting following', error: error.message, stack: error.stack });
  }
};

// Check if user follows another user
const isFollowing = async (req, res) => {
  try {
    const { followed_user_id: followed_user_id_param2, follower_user_id: follower_user_id_param2 } = req.params;
    const followed_user_id = followed_user_id_param2 || follower_user_id_param2;
    const user_id = req.user.id;

    const follow = await Follower.findOne({
      where: { user_id, followed_user_id },
    });

    res.status(200).json({
      isFollowing: !!follow,
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Error checking follow status', error });
  }
};

// Remove a follower (force unfollow)
const removeFollower = async (req, res) => {
  try {
    const { user_id_to_remove } = req.params; // The user ID of the follower to remove
    const current_user_id = req.user.id; // The logged-in user (me)

    // I want to remove 'user_id_to_remove' from my followers list.
    // In the database, this means deleting the row where:
    // user_id = user_id_to_remove (the person following)
    // followed_user_id = current_user_id (me, the person being followed)

    const follow = await Follower.findOne({
      where: { 
        user_id: user_id_to_remove,
        followed_user_id: current_user_id
      },
    });

    if (!follow) {
      return res.status(404).json({ message: 'Follower not found' });
    }

    await follow.destroy();

    res.status(200).json({ message: 'Successfully removed follower' });
  } catch (error) {
    console.error('Error removing follower:', error);
    res.status(500).json({ message: 'Error removing follower', error: error.message });
  }
};

module.exports = {
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  isFollowing,
  removeFollower
};
