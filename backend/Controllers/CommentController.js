const Comment = require('../models/Comment');
const User = require('../models/User');

const addComment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;
    const { content, parent_comment_id } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'İçerik gerekli' });
    }

    const newComment = await Comment.create({
      post_id,
      user_id,
      content: content.trim(),
      parent_comment_id: parent_comment_id || null,
    });

    return res.status(201).json({ message: 'Yorum eklendi', comment: newComment });
  } catch (e) {
    console.error('addComment error', e);
    return res.status(500).json({ message: 'Yorum ekleme hatası', error: e.message });
  }
};

const listComments = async (req, res) => {
  try {
    const { post_id } = req.params;
    const comments = await Comment.findAll({
      where: { post_id },
      order: [['created_at','ASC']],
      include: [{ model: User, attributes: ['user_id','username','name','surname'] }]
    });

    // Tree yapısı oluştur
    const map = {};
    comments.forEach(c => { map[c.comment_id] = { ...c.get({ plain: true }), replies: [] }; });
    const roots = [];
    comments.forEach(c => {
      const node = map[c.comment_id];
      if (c.parent_comment_id) {
        if (map[c.parent_comment_id]) {
          map[c.parent_comment_id].replies.push(node);
        } else {
          roots.push(node); // parent bulunmadıysa root'a ekle (koruma)
        }
      } else {
        roots.push(node);
      }
    });

    return res.status(200).json({ count: comments.length, data: roots });
  } catch (e) {
    console.error('listComments error', e);
    return res.status(500).json({ message: 'Yorum listeleme hatası', error: e.message });
  }
};

module.exports = { addComment, listComments };
