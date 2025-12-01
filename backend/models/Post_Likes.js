const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');

// Sequelize model name kept as PostLike for code clarity, table as Post_Likes per spec
const PostLike = sequelize.define('PostLike', {
  like_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'user_id' },
    onDelete: 'CASCADE'
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Post, key: 'post_id' },
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Post_Likes',
  timestamps: false,
  indexes: [{ unique: true, fields: ['post_id','user_id'] }]
});

Post.hasMany(PostLike, { foreignKey: 'post_id' });
PostLike.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(PostLike, { foreignKey: 'user_id' });
PostLike.belongsTo(User, { foreignKey: 'user_id' });

module.exports = PostLike;
