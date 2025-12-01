const Post = require('../models/Post');
const User = require('../models/User');
const PostLike = require('../models/Post_Likes');

// Create a new post
const createPost = async (req, res) => {
  try {
    const user_id = req.user.id; // set by auth middleware
    const { content, image_path, thumb_path } = req.body;

    if ((!content || content.trim().length === 0) && (!image_path || image_path.trim().length === 0)) {
      return res.status(400).json({ message: 'İçerik veya görsel yolundan en az biri gereklidir.' });
    }

    const newPost = await Post.create({
      user_id,
      content: content && content.trim().length > 0 ? content : null,
      image_path: image_path && image_path.trim().length > 0 ? image_path : null,
      thumb_path: thumb_path && thumb_path.trim().length > 0 ? thumb_path : null,
    });

    return res.status(201).json({ message: 'Post oluşturuldu', post: newPost });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: 'Post oluşturulurken hata oluştu', error: error.message });
  }
};

// (Opsiyonel) Basit feed: son paylaşımlar
const listRecentPosts = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const posts = await Post.findAll({
      order: [['shared_at', 'DESC']],
      limit,
      include: [
        { model: User, attributes: ['user_id', 'name', 'surname', 'username'] },
        { model: PostLike, attributes: ['like_id'], where: { user_id: req.user.id }, required: false }
      ],
    });
    // _liked bayrağı ekle ve PostLikes alanını kaldır (sadelik)
    const data = posts.map(p => {
      const plain = p.get({ plain: true });
      const liked = Array.isArray(plain.PostLikes) && plain.PostLikes.length > 0;
      delete plain.PostLikes;
      return { ...plain, _liked: liked };
    });
    return res.status(200).json({ data });
  } catch (error) {
    console.error('List posts error:', error);
    return res.status(500).json({ message: 'Postlar listelenirken hata oluştu', error: error.message });
  }
};

module.exports = { createPost, listRecentPosts };
