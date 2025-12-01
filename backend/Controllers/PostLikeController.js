const PostLike = require('../models/Post_Likes');
const Post = require('../models/Post');
const User = require('../models/User');

const likePost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;

    const existing = await PostLike.findOne({ where: { post_id, user_id } });
    if (existing) {
      return res.status(200).json({ message: 'Already liked', liked: true });
    }

    await PostLike.create({ post_id, user_id });
    await Post.increment('like_count', { by: 1, where: { post_id } });
    return res.status(201).json({ message: 'Liked', liked: true });
  } catch (e) {
    console.error('likePost error', e);
    return res.status(500).json({ message: 'Like error', error: e.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;
    const existing = await PostLike.findOne({ where: { post_id, user_id } });
    if (!existing) {
      return res.status(404).json({ message: 'Not liked', liked: false });
    }
    await existing.destroy();
    await Post.decrement('like_count', { by: 1, where: { post_id } });
    return res.status(200).json({ message: 'Unliked', liked: false });
  } catch (e) {
    console.error('unlikePost error', e);
    return res.status(500).json({ message: 'Unlike error', error: e.message });
  }
};

const listPostLikes = async (req, res) => {
  try {
    const { post_id } = req.params;
    const likes = await PostLike.findAll({
      where: { post_id },
      include: [{ model: User, attributes: ['user_id','username','name','surname'] }]
    });
    return res.status(200).json({ count: likes.length, data: likes });
  } catch (e) {
    console.error('listPostLikes error', e);
    return res.status(500).json({ message: 'List likes error', error: e.message });
  }
};

module.exports = { likePost, unlikePost, listPostLikes };
