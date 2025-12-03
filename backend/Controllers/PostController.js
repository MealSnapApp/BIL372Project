const Post = require('../models/Post');
const User = require('../models/User');
const PostLike = require('../models/Post_Likes');

// Create a new post
const createPost = async (req, res) => {
  try {
    const user_id = req.user.id; // set by auth middleware
    const { content, image_path } = req.body;

    if ((!content || content.trim().length === 0) && (!image_path || image_path.trim().length === 0)) {
      return res.status(400).json({ message: 'İçerik veya görsel yolundan en az biri gereklidir.' });
    }

    const newPost = await Post.create({
      user_id,
      content: content && content.trim().length > 0 ? content : null,
      image_path: image_path && image_path.trim().length > 0 ? image_path : null,
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
      const likeCount = Math.max(0, Number(plain.like_count || 0));
      return { ...plain, like_count: likeCount, _liked: liked };
    });
    return res.status(200).json({ data });
  } catch (error) {
    console.error('List posts error:', error);
    return res.status(500).json({ message: 'Postlar listelenirken hata oluştu', error: error.message });
  }
};

// Update an existing post (owner only)
const updatePost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;
    const { content, image_path } = req.body;

    const post = await Post.findByPk(post_id);
    if (!post) return res.status(404).json({ message: 'Post bulunamadı' });
    if (post.user_id !== user_id) return res.status(403).json({ message: 'Bu postu düzenleme yetkiniz yok' });

    const payload = {};
    if (typeof content === 'string') payload.content = content.trim() || null;
    if (typeof image_path === 'string') payload.image_path = image_path.trim() || null;

    await post.update(payload);
    return res.status(200).json({ message: 'Post güncellendi', post });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ message: 'Post güncellenirken hata oluştu', error: error.message });
  }
};

module.exports = { createPost, listRecentPosts, updatePost };

// List posts created by current user
const listMyPosts = async (req, res) => {
  try {
    const user_id = req.user.id;
    const posts = await Post.findAll({
      where: { user_id },
      order: [['shared_at', 'DESC']],
      include: [
        { model: User, attributes: ['user_id', 'name', 'surname', 'username'] },
        { model: PostLike, attributes: ['like_id'], where: { user_id }, required: false }
      ],
    });
    const data = posts.map(p => {
      const plain = p.get({ plain: true });
      const liked = Array.isArray(plain.PostLikes) && plain.PostLikes.length > 0;
      delete plain.PostLikes;
      const likeCount = Math.max(0, Number(plain.like_count || 0));
      return { ...plain, like_count: likeCount, _liked: liked };
    });
    return res.status(200).json({ data });
  } catch (error) {
    console.error('List my posts error:', error);
    return res.status(500).json({ message: 'Kullanıcı postları listelenirken hata oluştu', error: error.message });
  }
};

module.exports.listMyPosts = listMyPosts;

// Delete a post (owner only)
const deletePost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;
    const post = await Post.findByPk(post_id);
    if (!post) return res.status(404).json({ message: 'Post bulunamadı' });
    if (post.user_id !== user_id) return res.status(403).json({ message: 'Bu postu silme yetkiniz yok' });
    await post.destroy();
    return res.status(200).json({ message: 'Post silindi', success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: 'Post silinirken hata oluştu', error: error.message });
  }
};

module.exports.deletePost = deletePost;
