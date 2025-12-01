const CommentLike = require('../models/Comment_Likes');
const Comment = require('../models/Comment');

exports.likeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;

    const comment = await Comment.findOne({ where: { comment_id } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const [like, created] = await CommentLike.findOrCreate({
      where: { comment_id, user_id },
      defaults: { comment_id, user_id }
    });

    if (!created) return res.status(200).json({ message: 'Already liked' });
    return res.status(201).json({ message: 'Liked', like_id: like.like_id });
  } catch (err) {
    console.error('likeComment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.unlikeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;

    const deleted = await CommentLike.destroy({ where: { comment_id, user_id } });
    if (!deleted) return res.status(404).json({ message: 'Like not found' });
    return res.status(200).json({ message: 'Unliked' });
  } catch (err) {
    console.error('unlikeComment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.listCommentLikes = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const likes = await CommentLike.findAll({
      where: { comment_id },
      include: [{ model: require('../models/User'), attributes: ['user_id','username'] }],
      order: [['created_at', 'DESC']]
    });
    const users = likes.map(l => ({ user_id: l.User.user_id, username: l.User.username }));
    return res.status(200).json({ users, count: users.length });
  } catch (err) {
    console.error('listCommentLikes error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
