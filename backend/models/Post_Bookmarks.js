const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');

const PostBookmark = sequelize.define('PostBookmark', {
  bookmark_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Post, key: 'post_id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'user_id' },
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Post_Bookmarks',
  timestamps: false,
  indexes: [{ unique: true, fields: ['post_id','user_id'] }]
});

Post.hasMany(PostBookmark, { foreignKey: 'post_id' });
PostBookmark.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(PostBookmark, { foreignKey: 'user_id' });
PostBookmark.belongsTo(User, { foreignKey: 'user_id' });

module.exports = PostBookmark;
