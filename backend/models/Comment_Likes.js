const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Comment = require('./Comment');

const CommentLike = sequelize.define('CommentLike', {
  comment_like_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true
  },
  comment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Comment, key: 'comment_id' },
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
  tableName: 'Comment_Likes',
  timestamps: false,
  indexes: [{ unique: true, fields: ['comment_id','user_id'] }]
});

Comment.hasMany(CommentLike, { foreignKey: 'comment_id' });
CommentLike.belongsTo(Comment, { foreignKey: 'comment_id' });
User.hasMany(CommentLike, { foreignKey: 'user_id' });
CommentLike.belongsTo(User, { foreignKey: 'user_id' });

module.exports = CommentLike;
