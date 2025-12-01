const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');

const Comment = sequelize.define('Comment', {
  comment_id: {
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
  root_comment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Comment', key: 'comment_id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'user_id' },
    onDelete: 'CASCADE'
  },
  parent_comment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    // Self-referential FK to the same table
    references: { model: 'Comment', key: 'comment_id' },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  like_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Comment',
  timestamps: false,
  indexes: [
    { fields: ['post_id'] },
    { fields: ['parent_comment_id'] },
    { fields: ['root_comment_id'] }
  ]
});

Post.hasMany(Comment, { foreignKey: 'post_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.hasMany(Comment, { foreignKey: 'parent_comment_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_comment_id', as: 'parent' });

// root thread relations
Comment.belongsTo(Comment, { foreignKey: 'root_comment_id', as: 'root' });
Comment.hasMany(Comment, { foreignKey: 'root_comment_id', as: 'descendants' });

module.exports = Comment;
