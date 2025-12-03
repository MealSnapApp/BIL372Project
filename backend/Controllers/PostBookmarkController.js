const PostBookmark = require('../models/Post_Bookmarks');
const Post = require('../models/Post');
const User = require('../models/User');

const bookmarkPost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;

    const existing = await PostBookmark.findOne({ where: { post_id, user_id } });
    if (existing) {
      return res.status(200).json({ message: 'Already bookmarked', bookmarked: true });
    }

    const created = await PostBookmark.create({ post_id, user_id });
    console.log('Bookmark created:', { user_id, post_id, bookmark_id: created.bookmark_id });
    return res.status(201).json({ message: 'Bookmarked', bookmarked: true });
  } catch (e) {
    console.error('bookmarkPost error', e);
    return res.status(500).json({ message: 'Bookmark error', error: e.message });
  }
};

const unbookmarkPost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;
    const existing = await PostBookmark.findOne({ where: { post_id, user_id } });
    if (!existing) {
      return res.status(404).json({ message: 'Not bookmarked', bookmarked: false });
    }
    await existing.destroy();
    return res.status(200).json({ message: 'Unbookmarked', bookmarked: false });
  } catch (e) {
    console.error('unbookmarkPost error', e);
    return res.status(500).json({ message: 'Unbookmark error', error: e.message });
  }
};

const listSavedPosts = async (req, res) => {
  try {
    const user_id = req.user.id;
    // Fetch bookmarks with posts and post owners
    const saved = await PostBookmark.findAll({
      where: { user_id },
      include: [{
        model: Post,
        include: [{ model: User, attributes: ['user_id','username','name','surname'] }]
      }],
      order: [['created_at','DESC']]
    });

    // Normalize: return array of Post with bookmark metadata
    const data = saved.map(b => {
      const postObj = (b.Post && b.Post.toJSON) ? b.Post.toJSON() : (b.Post || {});
      const likeCount = Math.max(0, Number(postObj.like_count || 0));
      return {
        bookmark_id: b.bookmark_id,
        created_at: b.created_at,
        ...postObj,
        like_count: likeCount,
      };
    });

    console.log('Saved posts fetched:', { user_id, count: data.length });
    return res.status(200).json({ count: data.length, data });
  } catch (e) {
    console.error('listSavedPosts error', e);
    return res.status(500).json({ message: 'List saved posts error', error: e.message });
  }
};

module.exports = { bookmarkPost, unbookmarkPost, listSavedPosts };
