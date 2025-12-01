const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Follower = sequelize.define(
  'Follower',
  {
    follower_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'user_id',
      },
      onDelete: 'CASCADE',
    },
    followed_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'user_id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'followers',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['user_id', 'followed_user_id'] },
      { fields: ['followed_user_id'] },
      { fields: ['user_id'] }
    ]
  }
);

// Define associations
Follower.belongsTo(User, { foreignKey: 'user_id', as: 'followingUser' });
Follower.belongsTo(User, { foreignKey: 'followed_user_id', as: 'followedUser' });

module.exports = Follower;
